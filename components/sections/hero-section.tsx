"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Phone } from "lucide-react"
import { RequestFormModal } from "@/components/ui/request-form-modal"
import { siteConfig } from "@/lib/site-config"

export function HeroSection() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center py-24">
      {/* Content - no local background, uses global skyscraper */}
      <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-4xl md:text-6xl lg:text-7xl font-black text-white mb-6 leading-tight text-balance"
        >
          Лифтовое оборудование «под ключ»
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-xl md:text-2xl lg:text-3xl font-semibold text-white/90 mb-10"
        >
          Тише / быстрее / надежнее
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8"
        >
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-white text-black font-bold px-8 py-4 text-lg hover:bg-white/90 transition-colors"
          >
            Оставить заявку
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 text-white/80"
        >
          {[...siteConfig.phones].reverse().map((phone, index) => (
            <div key={phone.href} className="flex items-center gap-4">
              {index > 0 && <span className="hidden sm:block text-white/50">|</span>}
              <a href={phone.href} className="flex items-center gap-2 hover:text-white transition-colors">
                <Phone className="w-5 h-5" />
                <span className="font-semibold">{phone.display}</span>
              </a>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center"
        >
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-1.5 h-3 bg-white/70 rounded-full mt-2"
          />
        </motion.div>
      </motion.div>

      {/* Request Form Modal */}
      <RequestFormModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        source="hero-modal"
      />
    </div>
  )
}
