"use client"

import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef } from "react"
import { Shield, Award, Globe, Users, BadgeCheck, Scale } from "lucide-react"

const advantages = [
  { icon: Shield, text: "Работа по ГОСТ" },
  { icon: Award, text: "Лицензии и допуски" },
  { icon: Globe, text: "Стандарты гарантии международного уровня" },
  { icon: Users, text: "Аттестованные инженеры" },
  { icon: BadgeCheck, text: "Сертифицированное оборудование" },
  { icon: Scale, text: "Соответствие требованиям законодательства РК" },
]

export function AboutSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.3 })

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center px-4 md:px-8 py-20">
      <div ref={ref} className="max-w-6xl mx-auto w-full">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-8"
        >
          О нас
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg md:text-xl text-white/90 mb-12 max-w-4xl leading-relaxed"
        >
          Мы предлагаем полный спектр услуг в сфере лифтового оборудования — от сопровождения на этапе 
          проектирования до модернизации и сервисного обслуживания. Реализуем комплексные решения «под ключ», 
          обеспечивая надёжность и эффективность на каждом этапе проекта.
        </motion.p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {advantages.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
              className="flex items-center gap-4 bg-white/10 backdrop-blur-sm p-5 border border-white/20"
            >
              <item.icon className="w-8 h-8 text-white flex-shrink-0" />
              <span className="text-white font-semibold text-lg">{item.text}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
