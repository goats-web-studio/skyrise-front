"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import { FileText, ExternalLink } from "lucide-react"
import { mediaUrl, type Certificate } from "@/lib/api"

interface CertificatesSectionProps {
  certificates: Certificate[]
}

const isImage = (path: string | null) => Boolean(path && /\.(png|jpe?g|webp|gif|avif|svg)(\?.*)?$/i.test(path))

export function CertificatesSection({ certificates }: CertificatesSectionProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.2 })

  if (certificates.length === 0) return null

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center px-4 md:px-8 py-20">
      <div ref={ref} className="max-w-7xl mx-auto w-full">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-10 text-center"
        >
          Сертификаты
        </motion.h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {certificates.map((certificate, index) => {
            const href = mediaUrl(certificate.file || certificate.image)
            const preview = certificate.image || (isImage(certificate.file) ? certificate.file : null)
            const content = (
              <>
                <div className="relative aspect-[3/4] bg-white/5 overflow-hidden">
                  {preview ? (
                    <img
                      src={mediaUrl(preview)}
                      alt={certificate.title}
                      loading="lazy"
                      className="absolute inset-0 w-full h-full object-contain p-2 transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <FileText className="w-16 h-16 text-white/40" aria-hidden="true" />
                    </div>
                  )}
                  {href && (
                    <div className="absolute top-2 right-2 p-1.5 bg-black/60 rounded opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity">
                      <ExternalLink className="w-4 h-4 text-white" aria-hidden="true" />
                    </div>
                  )}
                </div>
                <div className="p-3 md:p-4">
                  <h3 className="text-sm md:text-base font-bold text-white line-clamp-2">{certificate.title}</h3>
                  {certificate.description && (
                    <p className="text-white/70 text-xs md:text-sm mt-1 line-clamp-2">{certificate.description}</p>
                  )}
                </div>
              </>
            )
            const className =
              "group flex flex-col h-full bg-white/10 backdrop-blur-sm border border-white/20 overflow-hidden hover:bg-white/15 hover:border-white/40 transition-colors"

            return (
              <motion.div
                key={certificate.id}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: Math.min(index, 8) * 0.08 }}
              >
                {href ? (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={className}
                    aria-label={`${certificate.title} — открыть в новой вкладке`}
                  >
                    {content}
                  </a>
                ) : (
                  <div className={className}>{content}</div>
                )}
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
