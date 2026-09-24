"use client"

import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"
import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { useBodyScrollLock } from "@/hooks/use-body-scroll-lock"

interface YouTubeModalProps {
  isOpen: boolean
  onClose: () => void
  videoUrl: string
  title: string
}

export function YouTubeModal({ isOpen, onClose, videoUrl, title }: YouTubeModalProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])
  useBodyScrollLock(isOpen)

  useEffect(() => {
    if (!isOpen) return
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", handleEscape)
    return () => window.removeEventListener("keydown", handleEscape)
  }, [isOpen, onClose])

  if (!mounted) return null

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label={title}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

          {/* Modal Content */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-4xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-4 mb-3">
              <div className="text-white font-bold text-lg truncate">{title}</div>
              <button
                type="button"
                onClick={onClose}
                autoFocus
                className="text-white/80 hover:text-white transition-colors flex items-center gap-2 flex-shrink-0"
              >
                <span className="text-sm">Закрыть</span>
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="aspect-video bg-black rounded-lg overflow-hidden">
              <iframe
                src={videoUrl}
                title={title}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  )
}
