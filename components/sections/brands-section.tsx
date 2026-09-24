"use client"

import { motion, useInView } from "framer-motion"
import { useCallback, useRef, useState } from "react"
import { Play } from "lucide-react"
import { YouTubeModal } from "@/components/ui/youtube-modal"
import { mediaUrl, youtubeEmbedUrl, type Brand } from "@/lib/api"
import { getIcon } from "@/lib/brand-icons"

interface BrandsSectionProps {
  brands: Brand[]
}

export function BrandsSection({ brands }: BrandsSectionProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.2 })
  const [activeBrand, setActiveBrand] = useState<Brand | null>(null)
  const closeModal = useCallback(() => setActiveBrand(null), [])

  if (brands.length === 0) return null

  const activeVideo = youtubeEmbedUrl(activeBrand?.youtubeUrl)

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center px-4 md:px-8 py-20">
      <div ref={ref} className="max-w-7xl mx-auto w-full">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-10 text-center"
        >
          Наши бренды
        </motion.h2>

        <div className={`grid grid-cols-1 gap-8 ${brands.length > 1 ? "lg:grid-cols-2" : "max-w-3xl mx-auto"}`}>
          {brands.map((brand, index) => {
            const hasVideo = Boolean(youtubeEmbedUrl(brand.youtubeUrl))
            return (
              <motion.div
                key={brand.id}
                initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.2 + index * 0.2 }}
                className="flex flex-col bg-white/10 backdrop-blur-sm border border-white/20 p-6"
              >
                <div className="flex items-center gap-4 mb-6">
                  {brand.logo && (
                    <img
                      src={mediaUrl(brand.logo)}
                      alt={`Логотип ${brand.name}`}
                      className="h-12 w-auto max-w-[160px] object-contain"
                      loading="lazy"
                    />
                  )}
                  <h3 className="text-3xl font-black text-white">{brand.name}</h3>
                </div>

                {brand.stats.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
                    {brand.stats.map((stat, statIndex) => {
                      const Icon = getIcon(stat.icon)
                      return (
                        <div key={`${stat.label}-${statIndex}`} className="text-center p-3 bg-white/5 rounded">
                          <Icon className="w-6 h-6 text-white/70 mx-auto mb-2" aria-hidden="true" />
                          <div className="text-xl font-bold text-white break-words">{stat.value}</div>
                          <div className="text-xs text-white/60">{stat.label}</div>
                        </div>
                      )
                    })}
                  </div>
                )}

                {brand.description && (
                  <div className="text-white/80 text-sm mb-6 whitespace-pre-line">
                    <p>{brand.description}</p>
                  </div>
                )}

                {hasVideo && (
                  <button
                    type="button"
                    onClick={() => setActiveBrand(brand)}
                    className="mt-auto self-start flex items-center gap-2 bg-white text-black font-bold px-6 py-3 rounded hover:bg-white/90 transition-colors"
                  >
                    <Play className="w-5 h-5" />
                    Ознакомиться с производством
                  </button>
                )}
              </motion.div>
            )
          })}
        </div>
      </div>

      <YouTubeModal
        isOpen={Boolean(activeBrand && activeVideo)}
        onClose={closeModal}
        videoUrl={activeVideo ?? ""}
        title={activeBrand ? `Производство ${activeBrand.name}` : ""}
      />
    </div>
  )
}
