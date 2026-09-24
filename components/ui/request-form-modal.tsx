"use client"

import { useState, useEffect, useId } from "react"
import { createPortal } from "react-dom"
import { motion, AnimatePresence } from "framer-motion"
import { X, CheckCircle2 } from "lucide-react"
import { submitLead, type LeadSource } from "@/lib/api"
import { formatPhone, isValidEmail, isValidPhone } from "@/lib/phone"
import { useBodyScrollLock } from "@/hooks/use-body-scroll-lock"

interface RequestFormModalProps {
  isOpen: boolean
  onClose: () => void
  source?: LeadSource
}

const initialForm = {
  name: "",
  phone: "",
  email: "",
  comment: "",
  consent: false,
  website: "",
}

type Status = "idle" | "loading" | "success" | "error"

export function RequestFormModal({ isOpen, onClose, source = "hero-modal" }: RequestFormModalProps) {
  const id = useId()
  const [mounted, setMounted] = useState(false)
  const [formData, setFormData] = useState(initialForm)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [status, setStatus] = useState<Status>("idle")
  const [serverError, setServerError] = useState("")

  useEffect(() => setMounted(true), [])
  useBodyScrollLock(isOpen)

  // Reset success/error state each time the modal is reopened
  useEffect(() => {
    if (isOpen) {
      setStatus((prev) => (prev === "loading" ? prev : "idle"))
      setServerError("")
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", handleEscape)
    return () => window.removeEventListener("keydown", handleEscape)
  }, [isOpen, onClose])

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, phone: formatPhone(e.target.value) })
    if (errors.phone) setErrors({ ...errors, phone: "" })
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    const newValue = type === "checkbox" ? (e.target as HTMLInputElement).checked : value
    setFormData({ ...formData, [name]: newValue })
    if (errors[name]) setErrors({ ...errors, [name]: "" })
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = "Введите имя"
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Введите телефон"
    } else if (!isValidPhone(formData.phone)) {
      newErrors.phone = "Введите корректный номер телефона"
    }

    if (!formData.email.trim()) {
      newErrors.email = "Введите email"
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = "Введите корректный email"
    }

    if (!formData.consent) {
      newErrors.consent = "Необходимо согласие"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (status === "loading" || !validate()) return

    setStatus("loading")
    setServerError("")

    const result = await submitLead({
      name: formData.name.trim(),
      phone: formData.phone,
      email: formData.email.trim() || undefined,
      comment: formData.comment.trim() || undefined,
      source,
      website: formData.website,
    })

    if (result.ok) {
      setStatus("success")
      setFormData(initialForm)
      setErrors({})
    } else {
      setStatus("error")
      setServerError(result.error)
    }
  }

  const isFormValid = Boolean(
    formData.name.trim() &&
    isValidPhone(formData.phone) &&
    isValidEmail(formData.email) &&
    formData.consent
  )
  const isLoading = status === "loading"
  const inputClass = (hasError?: string) =>
    `w-full px-4 py-3 bg-white/10 border rounded text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/50 transition-colors ${
      hasError ? "border-red-500" : "border-white/20"
    }`

  if (!mounted) return null

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-labelledby={`${id}-title`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto overscroll-contain"
          onClick={onClose}
        >
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md my-auto bg-zinc-900 border border-white/20 rounded-lg shadow-2xl"
          >
            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors"
              aria-label="Закрыть"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="p-6 md:p-8">
              <h2 id={`${id}-title`} className="text-2xl font-bold text-white mb-6">Оставить заявку</h2>

              {status === "success" ? (
                <div className="text-center py-6" role="status">
                  <CheckCircle2 className="w-14 h-14 text-green-400 mx-auto mb-4" />
                  <p className="text-white text-lg font-semibold mb-2">Спасибо, заявка отправлена!</p>
                  <p className="text-white/70 mb-6">Менеджер свяжется с вами в ближайшее время.</p>
                  <button
                    type="button"
                    onClick={onClose}
                    className="w-full py-3 font-bold rounded bg-white text-black hover:bg-white/90 transition-colors"
                  >
                    Закрыть
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                  {/* Honeypot: must stay empty */}
                  <div className="absolute left-0 top-0 w-px h-px overflow-hidden opacity-0 pointer-events-none" aria-hidden="true">
                    <label htmlFor={`${id}-website`}>Website</label>
                    <input
                      type="text"
                      id={`${id}-website`}
                      name="website"
                      tabIndex={-1}
                      autoComplete="off"
                      value={formData.website}
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <label htmlFor={`${id}-name`} className="block text-sm font-medium text-white/80 mb-1">
                      Имя *
                    </label>
                    <input
                      type="text"
                      id={`${id}-name`}
                      name="name"
                      autoComplete="name"
                      autoFocus
                      value={formData.name}
                      onChange={handleChange}
                      aria-invalid={Boolean(errors.name)}
                      className={inputClass(errors.name)}
                      placeholder="Ваше имя"
                    />
                    {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name}</p>}
                  </div>

                  <div>
                    <label htmlFor={`${id}-phone`} className="block text-sm font-medium text-white/80 mb-1">
                      Телефон *
                    </label>
                    <input
                      type="tel"
                      id={`${id}-phone`}
                      name="phone"
                      autoComplete="tel"
                      inputMode="tel"
                      value={formData.phone}
                      onChange={handlePhoneChange}
                      aria-invalid={Boolean(errors.phone)}
                      className={inputClass(errors.phone)}
                      placeholder="+7 (___) ___-__-__"
                    />
                    {errors.phone && <p className="text-red-400 text-sm mt-1">{errors.phone}</p>}
                  </div>

                  <div>
                    <label htmlFor={`${id}-email`} className="block text-sm font-medium text-white/80 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      id={`${id}-email`}
                      name="email"
                      autoComplete="email"
                      value={formData.email}
                      onChange={handleChange}
                      aria-invalid={Boolean(errors.email)}
                      className={inputClass(errors.email)}
                      placeholder="example@mail.com"
                    />
                    {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email}</p>}
                  </div>

                  <div>
                    <label htmlFor={`${id}-comment`} className="block text-sm font-medium text-white/80 mb-1">
                      Комментарий
                    </label>
                    <textarea
                      id={`${id}-comment`}
                      name="comment"
                      value={formData.comment}
                      onChange={handleChange}
                      rows={3}
                      className={`${inputClass()} resize-none`}
                      placeholder="Укажите тип лифта, количество остановок и пр."
                    />
                  </div>

                  <div>
                    <label htmlFor={`${id}-consent`} className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        id={`${id}-consent`}
                        name="consent"
                        checked={formData.consent}
                        onChange={handleChange}
                        className="mt-1 w-4 h-4 rounded border-white/20 bg-white/10 text-white focus:ring-white/50"
                      />
                      <span className={`text-sm ${errors.consent ? "text-red-400" : "text-white/70"}`}>
                        Согласен на обработку персональных данных *
                      </span>
                    </label>
                  </div>

                  {status === "error" && serverError && (
                    <p role="alert" className="text-red-400 text-sm bg-red-500/10 border border-red-500/30 rounded px-3 py-2">
                      {serverError}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={!isFormValid || isLoading}
                    aria-busy={isLoading}
                    className={`w-full py-4 font-bold text-lg rounded transition-colors ${
                      isFormValid && !isLoading
                        ? "bg-white text-black hover:bg-white/90 cursor-pointer"
                        : "bg-white/30 text-white/50 cursor-not-allowed"
                    }`}
                  >
                    {isLoading ? "Отправка..." : "Отправить заявку"}
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  )
}
