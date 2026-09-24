"use client"

import { motion, useInView } from "framer-motion"
import { useId, useRef, useState } from "react"
import { Phone, Mail, MapPin, Send, CheckCircle2 } from "lucide-react"
import { submitLead } from "@/lib/api"
import { formatPhone, isValidPhone } from "@/lib/phone"
import { siteConfig } from "@/lib/site-config"

const initialForm = { name: "", phone: "", message: "", consent: false, website: "" }

type Status = "idle" | "loading" | "success" | "error"

export function ContactsSection() {
  const ref = useRef(null)
  const id = useId()
  const isInView = useInView(ref, { once: true, amount: 0.3 })
  const [formData, setFormData] = useState(initialForm)
  const [status, setStatus] = useState<Status>("idle")
  const [message, setMessage] = useState("")

  const isFormValid = Boolean(formData.name.trim() && isValidPhone(formData.phone) && formData.consent)
  const isLoading = status === "loading"

  const update = (patch: Partial<typeof initialForm>) => {
    setFormData((prev) => ({ ...prev, ...patch }))
    if (status === "error" || status === "success") {
      setStatus("idle")
      setMessage("")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isLoading) return
    if (!isFormValid) {
      setStatus("error")
      setMessage(
        !formData.name.trim()
          ? "Введите имя"
          : !isValidPhone(formData.phone)
            ? "Введите корректный номер телефона"
            : "Необходимо согласие на обработку персональных данных"
      )
      return
    }

    setStatus("loading")
    setMessage("")

    const result = await submitLead({
      name: formData.name.trim(),
      phone: formData.phone,
      comment: formData.message.trim() || undefined,
      source: "contacts",
      website: formData.website,
    })

    if (result.ok) {
      setStatus("success")
      setMessage("Заявка отправлена! Мы свяжемся с вами в ближайшее время.")
      setFormData(initialForm)
    } else {
      setStatus("error")
      setMessage(result.error)
    }
  }

  const inputClass =
    "w-full bg-white/10 border border-white/20 px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-white/50 transition-colors"

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center px-4 md:px-8 py-20">
      <div ref={ref} className="max-w-6xl mx-auto w-full">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-12 text-center"
        >
          Контакты
        </motion.h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-8"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/10 flex items-center justify-center flex-shrink-0">
                <Phone className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-white/60 text-sm mb-1">Телефоны</p>
                {siteConfig.phones.map((phone) => (
                  <a
                    key={phone.href}
                    href={phone.href}
                    className="text-white font-bold text-lg block hover:text-white/80 transition-colors"
                  >
                    {phone.display}
                  </a>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/10 flex items-center justify-center flex-shrink-0">
                <Mail className="w-6 h-6 text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-white/60 text-sm mb-1">Email</p>
                <a
                  href={`mailto:${siteConfig.email}`}
                  className="text-white font-bold text-lg hover:text-white/80 transition-colors break-all"
                >
                  {siteConfig.email}
                </a>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/10 flex items-center justify-center flex-shrink-0">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-white/60 text-sm mb-1">Адрес</p>
                <p className="text-white font-bold text-lg">{siteConfig.address}</p>
              </div>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.form
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
            onSubmit={handleSubmit}
            noValidate
            className="relative bg-white/10 backdrop-blur-sm border border-white/20 p-6 md:p-8"
          >
            <h3 className="text-2xl font-bold text-white mb-6">Оставить заявку</h3>

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
                onChange={(e) => update({ website: e.target.value })}
              />
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor={`${id}-name`} className="block text-white/70 text-sm mb-2">Имя *</label>
                <input
                  type="text"
                  id={`${id}-name`}
                  name="name"
                  autoComplete="name"
                  value={formData.name}
                  onChange={(e) => update({ name: e.target.value })}
                  required
                  className={inputClass}
                  placeholder="Ваше имя"
                />
              </div>

              <div>
                <label htmlFor={`${id}-phone`} className="block text-white/70 text-sm mb-2">Телефон *</label>
                <input
                  type="tel"
                  id={`${id}-phone`}
                  name="phone"
                  autoComplete="tel"
                  inputMode="tel"
                  value={formData.phone}
                  onChange={(e) => update({ phone: formatPhone(e.target.value) })}
                  required
                  className={inputClass}
                  placeholder="+7 (___) ___-__-__"
                />
              </div>

              <div>
                <label htmlFor={`${id}-message`} className="block text-white/70 text-sm mb-2">Сообщение</label>
                <textarea
                  id={`${id}-message`}
                  name="message"
                  value={formData.message}
                  onChange={(e) => update({ message: e.target.value })}
                  rows={4}
                  className={`${inputClass} resize-none`}
                  placeholder="Ваше сообщение"
                />
              </div>

              <label htmlFor={`${id}-consent`} className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  id={`${id}-consent`}
                  name="consent"
                  checked={formData.consent}
                  onChange={(e) => update({ consent: e.target.checked })}
                  className="mt-1 w-4 h-4 rounded border-white/20 bg-white/10 text-white focus:ring-white/50"
                />
                <span className="text-sm text-white/70">Согласен на обработку персональных данных *</span>
              </label>

              {message && (
                <p
                  role={status === "error" ? "alert" : "status"}
                  className={`flex items-start gap-2 text-sm px-3 py-2 border ${
                    status === "success"
                      ? "text-green-300 bg-green-500/10 border-green-500/30"
                      : "text-red-300 bg-red-500/10 border-red-500/30"
                  }`}
                >
                  {status === "success" && <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />}
                  {message}
                </p>
              )}

              <button
                type="submit"
                disabled={isLoading}
                aria-busy={isLoading}
                className="w-full bg-white text-black font-bold py-4 flex items-center justify-center gap-2 hover:bg-white/90 transition-colors disabled:bg-white/30 disabled:text-white/50 disabled:cursor-not-allowed"
              >
                <Send className="w-5 h-5" />
                {isLoading ? "Отправка..." : "Отправить"}
              </button>
            </div>
          </motion.form>
        </div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-12 pt-8 border-t border-white/20 text-center"
        >
          <p className="text-white/50 text-sm">
            © {new Date().getFullYear()} {siteConfig.name}. Все права защищены.
          </p>
        </motion.div>
      </div>
    </div>
  )
}
