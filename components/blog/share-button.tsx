"use client"

import { useEffect, useRef, useState } from "react"
import { Check, Share2 } from "lucide-react"

interface ShareButtonProps {
  title: string
}

export function ShareButton({ title }: ShareButtonProps) {
  const [feedback, setFeedback] = useState("")
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  const showFeedback = (text: string) => {
    setFeedback(text)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => setFeedback(""), 2000)
  }

  const handleShare = async () => {
    const url = window.location.href

    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title, url })
        return
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return
      }
    }

    try {
      await navigator.clipboard.writeText(url)
      showFeedback("Ссылка скопирована")
    } catch {
      showFeedback("Не удалось скопировать ссылку")
    }
  }

  return (
    <div className="relative flex items-center">
      <span
        role="status"
        aria-live="polite"
        className={`absolute right-full mr-2 whitespace-nowrap text-sm text-white/80 bg-black/80 px-2 py-1 rounded transition-opacity ${
          feedback ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        {feedback}
      </span>
      <button
        type="button"
        onClick={handleShare}
        aria-label="Поделиться статьёй"
        className="p-2 text-white/70 hover:text-white transition-colors"
      >
        {feedback === "Ссылка скопирована" ? <Check className="w-5 h-5" /> : <Share2 className="w-5 h-5" />}
      </button>
    </div>
  )
}
