"use client"

import { useCallback, useState } from "react"
import { RequestFormModal } from "@/components/ui/request-form-modal"

export function RequestButton({ label = "Оставить заявку" }: { label?: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const close = useCallback(() => setIsOpen(false), [])

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-block px-6 py-3 bg-white text-black font-bold rounded hover:bg-white/90 transition-colors"
      >
        {label}
      </button>
      <RequestFormModal isOpen={isOpen} onClose={close} source="blog-article" />
    </>
  )
}
