"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"

const stages = [
  {
    number: "01",
    title: "Проектирование",
    description: "Минимизируем ошибки проектирования и оптимизируем бюджет еще до начала строительства"
  },
  {
    number: "02",
    title: "Поставка",
    description: "Организуем поставку оборудования напрямую от производителей с полной документацией"
  },
  {
    number: "03",
    title: "Монтаж",
    description: "Профессиональный монтаж силами аттестованных специалистов с соблюдением всех норм"
  },
  {
    number: "04",
    title: "Сервис",
    description: "Круглосуточное техническое обслуживание и оперативное устранение неисправностей"
  },
  {
    number: "05",
    title: "Модернизация",
    description: "Обновление устаревшего оборудования с повышением безопасности и энергоэффективности"
  },
]

export function StagesSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.3 })

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center px-4 md:px-8 py-20">
      <div ref={ref} className="max-w-7xl mx-auto w-full">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-12 text-center"
        >
          Этапы работ
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {stages.map((stage, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white/10 backdrop-blur-sm border border-white/20 p-6 text-center"
            >
              <div className="text-5xl md:text-6xl font-black text-white/30 mb-4">
                {stage.number}
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{stage.title}</h3>
              <p className="text-white/70 text-sm leading-relaxed">{stage.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
