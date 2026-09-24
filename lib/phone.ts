export function formatPhone(value: string) {
  const digits = value.replace(/\D/g, "")
  if (!digits) return ""

  let formatted = "+7"
  const phoneDigits = (digits.startsWith("7") || digits.startsWith("8") ? digits.slice(1) : digits).slice(0, 10)

  if (phoneDigits.length > 0) {
    formatted += " (" + phoneDigits.slice(0, 3)
  }
  if (phoneDigits.length >= 3) {
    formatted += ") " + phoneDigits.slice(3, 6)
  }
  if (phoneDigits.length >= 6) {
    formatted += "-" + phoneDigits.slice(6, 8)
  }
  if (phoneDigits.length >= 8) {
    formatted += "-" + phoneDigits.slice(8, 10)
  }

  return formatted
}

export function isValidPhone(phone: string) {
  return phone.replace(/\D/g, "").length >= 11
}

export function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}
