export const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000").replace(/\/+$/, "")

const TOKEN_KEY = "admin_token"

export type Id = string | number

export interface BrandStat {
  icon: string
  value: string
  label: string
}

export interface Brand {
  id: Id
  name: string
  description: string
  youtubeUrl: string | null
  logo: string | null
  stats: BrandStat[]
  sortOrder: number
}

export type BrandInput = Omit<Brand, "id">

export interface Certificate {
  id: Id
  title: string
  description: string
  image: string | null
  file: string | null
  sortOrder: number
}

export type CertificateInput = Omit<Certificate, "id">

export interface PostListItem {
  id: Id
  slug: string
  title: string
  excerpt: string
  coverImage: string | null
  publishedAt: string | null
  readTime: string | null
  keywords: string[]
  seoTitle: string
  seoDescription: string
  relatedSlugs: string[]
  isPublished: boolean
}

export interface Post extends PostListItem {
  content: string
}

export type PostInput = Omit<Post, "id">

export interface Lead {
  id: Id
  name: string
  phone: string | null
  email: string | null
  comment: string | null
  source: string | null
  whatsappSent: boolean
  createdAt: string
}

export class ApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null
  try {
    return window.localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export function setToken(token: string) {
  window.localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken() {
  try {
    window.localStorage.removeItem(TOKEN_KEY)
  } catch {}
}

export function logout() {
  clearToken()
  if (typeof window !== "undefined" && window.location.pathname !== "/admin/login") {
    window.location.href = "/admin/login"
  }
}

export function mediaUrl(path: string | null | undefined): string {
  if (!path) return ""
  if (/^(https?:)?\/\//i.test(path) || path.startsWith("data:") || path.startsWith("blob:")) return path
  return `${API_URL}${path.startsWith("/") ? "" : "/"}${path}`
}

export function errorMessage(err: unknown): string {
  if (err instanceof Error) return err.message
  return "Неизвестная ошибка"
}

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE"
  body?: unknown
  auth?: boolean
}

export async function apiFetch<T>(path: string, { method = "GET", body, auth = true }: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = {}
  const token = getToken()
  if (auth && token) headers.Authorization = `Bearer ${token}`

  let payload: BodyInit | undefined
  if (body instanceof FormData) {
    payload = body
  } else if (body !== undefined) {
    headers["Content-Type"] = "application/json"
    payload = JSON.stringify(body)
  }

  let res: Response
  try {
    res = await fetch(`${API_URL}${path}`, { method, headers, body: payload, cache: "no-store" })
  } catch {
    throw new ApiError("Сервер недоступен. Проверьте подключение.", 0)
  }

  let data: unknown = null
  const text = await res.text()
  if (text) {
    try {
      data = JSON.parse(text)
    } catch {
      data = text
    }
  }

  if (!res.ok) {
    const message =
      data && typeof data === "object" && "error" in data && typeof (data as { error: unknown }).error === "string"
        ? (data as { error: string }).error
        : res.status === 413
          ? "Файл слишком большой"
          : `Ошибка ${res.status}`
    if (res.status === 401 && auth) logout()
    throw new ApiError(message, res.status)
  }

  return data as T
}

export const adminApi = {
  login: (login: string, password: string) =>
    apiFetch<{ token: string }>("/api/auth/login", { method: "POST", body: { login, password }, auth: false }),
  me: () => apiFetch<{ login: string }>("/api/auth/me"),

  listBrands: () => apiFetch<Brand[]>("/api/admin/brands"),
  createBrand: (data: BrandInput) => apiFetch<Brand>("/api/admin/brands", { method: "POST", body: data }),
  updateBrand: (id: Id, data: BrandInput) => apiFetch<Brand>(`/api/admin/brands/${id}`, { method: "PUT", body: data }),
  deleteBrand: (id: Id) => apiFetch<unknown>(`/api/admin/brands/${id}`, { method: "DELETE" }),

  listCertificates: () => apiFetch<Certificate[]>("/api/admin/certificates"),
  createCertificate: (data: CertificateInput) =>
    apiFetch<Certificate>("/api/admin/certificates", { method: "POST", body: data }),
  updateCertificate: (id: Id, data: CertificateInput) =>
    apiFetch<Certificate>(`/api/admin/certificates/${id}`, { method: "PUT", body: data }),
  deleteCertificate: (id: Id) => apiFetch<unknown>(`/api/admin/certificates/${id}`, { method: "DELETE" }),

  listPosts: () => apiFetch<PostListItem[]>("/api/admin/posts"),
  getPost: (id: Id) => apiFetch<Post>(`/api/admin/posts/${id}`),
  createPost: (data: PostInput) => apiFetch<Post>("/api/admin/posts", { method: "POST", body: data }),
  updatePost: (id: Id, data: PostInput) => apiFetch<Post>(`/api/admin/posts/${id}`, { method: "PUT", body: data }),
  deletePost: (id: Id) => apiFetch<unknown>(`/api/admin/posts/${id}`, { method: "DELETE" }),

  listLeads: () => apiFetch<Lead[]>("/api/admin/leads"),
  deleteLead: (id: Id) => apiFetch<unknown>(`/api/admin/leads/${id}`, { method: "DELETE" }),

  upload: (file: File) => {
    const fd = new FormData()
    fd.append("file", file)
    return apiFetch<{ url: string }>("/api/admin/upload", { method: "POST", body: fd })
  },
}

export const UPLOAD_MAX_BYTES = 15 * 1024 * 1024

export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return "—"
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return "—"
  return d.toLocaleString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—"
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return "—"
  return d.toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" })
}
