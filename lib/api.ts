export const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000").replace(/\/+$/, "")

export type BrandStat = {
  icon: string
  value: string
  label: string
}

export type Brand = {
  id: number | string
  name: string
  description: string
  youtubeUrl: string | null
  logo: string | null
  stats: BrandStat[]
  sortOrder: number
}

export type Certificate = {
  id: number | string
  title: string
  description: string | null
  image: string | null
  file: string | null
  sortOrder: number
}

export type PostSummary = {
  id: number | string
  slug: string
  title: string
  excerpt: string
  coverImage: string | null
  publishedAt: string
  readTime: string | null
  keywords: string[]
  seoTitle: string | null
  seoDescription: string | null
}

export type RelatedPost = {
  slug: string
  title: string
  coverImage: string | null
}

export type Post = PostSummary & {
  content: string
  related: RelatedPost[]
}

export type LeadSource = "hero-modal" | "contacts" | "blog-article"

export type LeadPayload = {
  name: string
  phone: string
  email?: string
  comment?: string
  source?: LeadSource | string
  website?: string
}

export function mediaUrl(path: string | null | undefined): string {
  if (!path) return ""
  if (/^https?:\/\//i.test(path)) return path
  return `${API_URL}${path.startsWith("/") ? "" : "/"}${path}`
}

async function getJson<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${API_URL}${path}`, { next: { revalidate: 60 } })
    if (!res.ok) return null
    return (await res.json()) as T
  } catch {
    return null
  }
}

function bySortOrder<T extends { sortOrder: number }>(items: T[]) {
  return [...items].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
}

export async function getBrands(): Promise<Brand[]> {
  const data = await getJson<Brand[]>("/api/brands")
  if (!Array.isArray(data)) return []
  return bySortOrder(data).map((brand) => ({
    ...brand,
    stats: Array.isArray(brand.stats) ? brand.stats : [],
  }))
}

export async function getCertificates(): Promise<Certificate[]> {
  const data = await getJson<Certificate[]>("/api/certificates")
  return Array.isArray(data) ? bySortOrder(data) : []
}

export async function getPosts(): Promise<PostSummary[]> {
  const data = await getJson<PostSummary[]>("/api/posts")
  return Array.isArray(data) ? data : []
}

export async function getPost(slug: string): Promise<Post | null> {
  const data = await getJson<Post>(`/api/posts/${encodeURIComponent(slug)}`)
  if (!data || typeof data !== "object") return null
  return { ...data, keywords: data.keywords ?? [], related: data.related ?? [] }
}

export async function submitLead(payload: LeadPayload): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const res = await fetch(`${API_URL}/api/leads`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
    if (res.ok) return { ok: true }
    let error = res.status === 429
      ? "Слишком много заявок. Попробуйте позже."
      : "Не удалось отправить заявку. Проверьте данные и попробуйте снова."
    try {
      const data = await res.json()
      if (data && typeof data.error === "string" && data.error) error = data.error
    } catch {}
    return { ok: false, error }
  } catch {
    return { ok: false, error: "Сервер недоступен. Позвоните нам или попробуйте позже." }
  }
}

export function formatDate(iso: string | null | undefined) {
  if (!iso) return ""
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ""
  return new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "long", year: "numeric" })
    .format(date)
    .replace(/\s?г\.$/, "")
}

export function youtubeEmbedUrl(url: string | null | undefined): string | null {
  if (!url) return null
  let id: string | null = null
  try {
    const u = new URL(url.trim())
    const host = u.hostname.replace(/^www\.|^m\./, "")
    if (host === "youtu.be") {
      id = u.pathname.split("/")[1] || null
    } else if (host.endsWith("youtube.com") || host.endsWith("youtube-nocookie.com")) {
      if (u.searchParams.get("v")) {
        id = u.searchParams.get("v")
      } else {
        const m = u.pathname.match(/^\/(?:embed|shorts|live|v)\/([^/?#]+)/)
        id = m ? m[1] : null
      }
    }
  } catch {
    if (/^[\w-]{11}$/.test(url.trim())) id = url.trim()
  }
  if (!id) return null
  return `https://www.youtube.com/embed/${id}?autoplay=1&mute=1`
}
