"use client"

import { useRef, useState, useEffect, useCallback, useMemo, type ReactNode } from "react"
import Link from "next/link"
import { motion, useScroll, useTransform } from "framer-motion"
import { HeroSection } from "@/components/sections/hero-section"
import { AboutSection } from "@/components/sections/about-section"
import { ProductsSection } from "@/components/sections/products-section"
import { StagesSection } from "@/components/sections/stages-section"
import { BrandsSection } from "@/components/sections/brands-section"
import { CertificatesSection } from "@/components/sections/certificates-section"
import { ContactsSection } from "@/components/sections/contacts-section"
import { siteConfig } from "@/lib/site-config"
import type { Brand, Certificate } from "@/lib/api"

interface HomeClientProps {
  brands: Brand[]
  certificates: Certificate[]
}

type SectionItem = {
  id: string
  label: string
  node: ReactNode
}

const DESKTOP_QUERY = "(min-width: 1024px) and (pointer: fine)"
const SCROLL_LOCK_MS = 900
const EDGE_EPSILON = 2

function isEditableTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false
  if (target.isContentEditable) return true
  return Boolean(target.closest("input, textarea, select, [contenteditable]:not([contenteditable='false'])"))
}

function isDialogOpen() {
  return Boolean(document.querySelector("[role='dialog']"))
}

export function HomeClient({ brands, certificates }: HomeClientProps) {
  const sections = useMemo<SectionItem[]>(() => {
    const list: (SectionItem | null)[] = [
      { id: "hero", label: "Главная", node: <HeroSection /> },
      { id: "about", label: "О нас", node: <AboutSection /> },
      { id: "products", label: "Продукция", node: <ProductsSection /> },
      { id: "stages", label: "Этапы", node: <StagesSection /> },
      brands.length > 0 ? { id: "brands", label: "Бренды", node: <BrandsSection brands={brands} /> } : null,
      certificates.length > 0
        ? { id: "certificates", label: "Сертификаты", node: <CertificatesSection certificates={certificates} /> }
        : null,
      { id: "contacts", label: "Контакты", node: <ContactsSection /> },
    ]
    return list.filter((item): item is SectionItem => item !== null)
  }, [brands, certificates])

  const [activeIndex, setActiveIndex] = useState(0)
  const [isDesktop, setIsDesktop] = useState(false)
  const activeIndexRef = useRef(0)
  const isScrollingRef = useRef(false)
  const scrollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([])

  const setActive = useCallback((index: number) => {
    activeIndexRef.current = index
    setActiveIndex(index)
  }, [])

  // Track scroll progress of the container for the parallax background
  const { scrollYProgress } = useScroll({ container: containerRef })
  // Background image is 400vh tall, viewport is 100vh, so max travel is 300vh
  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0vh", "-300vh"])

  // Full-page wheel/keyboard navigation is only enabled on desktop with a precise pointer
  useEffect(() => {
    const mql = window.matchMedia(DESKTOP_QUERY)
    const update = () => setIsDesktop(mql.matches)
    update()
    mql.addEventListener("change", update)
    return () => mql.removeEventListener("change", update)
  }, [])

  useEffect(() => {
    return () => {
      if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current)
    }
  }, [])

  const scrollToSection = useCallback(
    (index: number, align: "start" | "end" = "start", force = false) => {
      const container = containerRef.current
      const section = sectionRefs.current[index]
      if (!container || !section) return
      if (isScrollingRef.current && !force) return

      isScrollingRef.current = true
      setActive(index)

      const top =
        align === "end"
          ? Math.max(section.offsetTop, section.offsetTop + section.offsetHeight - container.clientHeight)
          : section.offsetTop

      container.scrollTo({ top, behavior: "smooth" })

      if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current)
      scrollTimerRef.current = setTimeout(() => {
        isScrollingRef.current = false
      }, SCROLL_LOCK_MS)
    },
    [setActive]
  )

  // Track active section: the section crossing the vertical center of the viewport
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          const index = Number((entry.target as HTMLElement).dataset.index)
          if (!Number.isNaN(index)) setActive(index)
        })
      },
      { root: container, rootMargin: "-50% 0px -50% 0px", threshold: 0 }
    )

    sectionRefs.current.slice(0, sections.length).forEach((section) => {
      if (section) observer.observe(section)
    })

    return () => observer.disconnect()
  }, [sections, setActive])

  // Returns how many pixels of the active section remain beyond the viewport edge in the given direction
  const remainingInSection = useCallback((direction: 1 | -1) => {
    const container = containerRef.current
    const section = sectionRefs.current[activeIndexRef.current]
    if (!container || !section) return 0

    const viewTop = container.scrollTop
    const viewBottom = viewTop + container.clientHeight
    const sectionTop = section.offsetTop
    const sectionBottom = sectionTop + section.offsetHeight

    return direction > 0 ? sectionBottom - viewBottom : viewTop - sectionTop
  }, [])

  const goToNeighbour = useCallback(
    (direction: 1 | -1) => {
      const target = activeIndexRef.current + direction
      // No looping: stop at the first and the last section
      if (target < 0 || target >= sections.length) return
      scrollToSection(target, direction > 0 ? "start" : "end")
    },
    [sections.length, scrollToSection]
  )

  // Wheel: snap between sections, but let tall sections scroll natively until their edge
  useEffect(() => {
    const container = containerRef.current
    if (!container || !isDesktop) return

    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey) return // pinch-zoom
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return
      if (e.target instanceof Element && e.target.closest("[role='dialog']")) return

      const direction: 1 | -1 = e.deltaY > 0 ? 1 : -1

      if (isScrollingRef.current) {
        e.preventDefault()
        return
      }

      if (remainingInSection(direction) > EDGE_EPSILON) return // native scroll inside the section

      e.preventDefault()
      goToNeighbour(direction)
    }

    container.addEventListener("wheel", handleWheel, { passive: false })
    return () => container.removeEventListener("wheel", handleWheel)
  }, [isDesktop, remainingInSection, goToNeighbour])

  // Keyboard navigation
  useEffect(() => {
    if (!isDesktop) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return
      if (isEditableTarget(e.target) || isDialogOpen()) return

      let direction: 1 | -1
      let step: number
      const container = containerRef.current
      if (!container) return

      switch (e.key) {
        case "ArrowDown":
          direction = 1
          step = 120
          break
        case "ArrowUp":
          direction = -1
          step = 120
          break
        case "PageDown":
          direction = 1
          step = container.clientHeight * 0.85
          break
        case "PageUp":
          direction = -1
          step = container.clientHeight * 0.85
          break
        default:
          return
      }

      e.preventDefault()
      if (isScrollingRef.current) return

      const remaining = remainingInSection(direction)
      if (remaining > EDGE_EPSILON) {
        container.scrollBy({ top: direction * Math.min(step, remaining), behavior: "smooth" })
        return
      }

      goToNeighbour(direction)
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isDesktop, remainingInSection, goToNeighbour])

  return (
    <div className="relative h-dvh w-full overflow-hidden bg-black">
      {/* Animated Background - moves based on scroll progress */}
      <motion.div className="fixed inset-x-0 top-0 z-0 pointer-events-none" style={{ y: backgroundY }}>
        <div className="w-full h-[400vh]">
          <img src="/skyscraper.jpg" alt="" className="w-full h-full object-cover object-top" />
        </div>
      </motion.div>

      {/* Dark Overlay */}
      <div className="fixed inset-0 z-[1] bg-black/50 pointer-events-none" />

      {/* Logo Header - centered */}
      <div className="fixed top-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3">
        <img src="/logo.png" alt={siteConfig.name} className="h-10 w-auto" />
        <span className="text-white font-bold text-lg hidden sm:block">{siteConfig.name}</span>
      </div>

      {/* Blog Button - top right */}
      <Link
        href="/blog"
        className="fixed top-6 right-6 z-20 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white font-medium text-sm hover:bg-white/20 transition-colors rounded"
      >
        Блог
      </Link>

      {/* Scrollable Sections Container */}
      <div ref={containerRef} className="relative z-10 h-dvh overflow-y-auto overscroll-y-contain">
        {sections.map((section, index) => (
          <div
            key={section.id}
            id={section.id}
            data-index={index}
            ref={(el) => {
              sectionRefs.current[index] = el
            }}
            className="min-h-screen w-full"
          >
            {section.node}
          </div>
        ))}
      </div>

      {/* Navigation Dots */}
      <nav
        aria-label="Навигация по секциям"
        className="fixed right-6 top-1/2 -translate-y-1/2 z-20 hidden md:flex flex-col gap-3"
      >
        {sections.map((section, index) => (
          <button
            key={section.id}
            type="button"
            onClick={() => scrollToSection(index, "start", true)}
            className="group relative flex items-center"
            aria-label={`Перейти к секции ${section.label}`}
            aria-current={index === activeIndex ? "true" : undefined}
          >
            <span className="absolute right-8 px-2 py-1 bg-black/80 text-white text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap rounded">
              {section.label}
            </span>
            <motion.div
              className={`w-3 h-3 rounded-full border-2 transition-colors ${
                index === activeIndex
                  ? "bg-white border-white"
                  : "bg-transparent border-white/50 hover:border-white"
              }`}
              animate={{ scale: index === activeIndex ? 1.2 : 1 }}
              transition={{ duration: 0.2 }}
            />
          </button>
        ))}
      </nav>

      {/* Section Counter */}
      <div className="fixed bottom-6 left-6 z-20 text-white/70 font-mono text-sm hidden md:block" aria-hidden="true">
        <span className="text-white font-bold text-2xl">{String(activeIndex + 1).padStart(2, "0")}</span>
        <span className="mx-2">/</span>
        <span>{String(sections.length).padStart(2, "0")}</span>
      </div>
    </div>
  )
}
