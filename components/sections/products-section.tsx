"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import Image from "next/image"

const products = [
  { 
    image: "/products/passenger.jpg", 
    title: "Пассажирские лифты", 
    description: "Для жилых и общественных зданий" 
  },
  { 
    image: "/products/panoramic.jpg", 
    title: "Панорамные лифты", 
    description: "Стеклянные кабины с обзором" 
  },
  { 
    image: "/products/freight.jpg", 
    title: "Грузовые и автомобильные лифты", 
    description: "Для складов и паркингов" 
  },
  { 
    image: "/products/hospital.jpeg", 
    title: "Больничные лифты", 
    description: "Для медицинских учреждений" 
  },
  { 
    image: "/products/kitchen.jpg", 
    title: "Кухонные лифты", 
    description: "Малые грузовые подъёмники" 
  },
  { 
    image: "/products/cottage.jpg", 
    title: "Коттеджные лифты", 
    description: "Для частных домов" 
  },
  { 
    image: "/products/escalator.jpg", 
    title: "Эскалаторы и траволаторы", 
    description: "Для ТЦ, метро и аэропортов" 
  },
]

export function ProductsSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.2 })

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center px-4 md:px-8 py-20">
      <div ref={ref} className="max-w-7xl mx-auto w-full">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-10 text-center"
        >
          Наша продукция
        </motion.h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {products.map((product, index) => (
            <motion.div
              key={product.title}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              whileHover={{ scale: 1.03 }}
              className="group relative overflow-hidden aspect-[4/5]"
            >
              <Image
                src={product.image}
                alt={product.title}
                fill
                sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-3 md:p-4">
                <h3 className="text-sm md:text-base lg:text-lg font-bold text-white mb-0.5">{product.title}</h3>
                <p className="text-white/80 text-xs md:text-sm line-clamp-2">{product.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
