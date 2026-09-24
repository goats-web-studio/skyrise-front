"use client"

import { motion } from "framer-motion"
import type { ReactNode } from "react"

interface FadeInProps {
  children: ReactNode
  delay?: number
  y?: number
  className?: string
  as?: "div" | "article"
}

export function FadeIn({ children, delay = 0, y = 20, className, as = "div" }: FadeInProps) {
  const Component = as === "article" ? motion.article : motion.div
  return (
    <Component
      initial={{ opacity: 0, y }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={className}
    >
      {children}
    </Component>
  )
}
