"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Award, ExternalLink, FileText, Inbox, Loader2, LogOut, Menu, Tag, X } from "lucide-react"
import { Toaster } from "@/components/ui/sonner"
import { Button } from "@/components/ui/button"
import { adminApi, ApiError, errorMessage, getToken, logout } from "@/lib/admin-api"
import { cn } from "@/lib/utils"

const NAV = [
  { href: "/admin/leads", label: "Заявки", icon: Inbox },
  { href: "/admin/brands", label: "Бренды", icon: Tag },
  { href: "/admin/certificates", label: "Сертификаты", icon: Award },
  { href: "/admin/posts", label: "Блог", icon: FileText },
]

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isLogin = pathname === "/admin/login"

  return (
    <div className="dark min-h-screen bg-zinc-950 text-white">
      {isLogin ? children : <ProtectedArea>{children}</ProtectedArea>}
      <Toaster theme="dark" position="top-right" richColors closeButton />
    </div>
  )
}

function ProtectedArea({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [status, setStatus] = useState<"checking" | "ok" | "error">("checking")
  const [user, setUser] = useState<string>("")
  const [error, setError] = useState("")
  const [menuOpen, setMenuOpen] = useState(false)

  const check = useCallback(async () => {
    if (!getToken()) {
      router.replace("/admin/login")
      return
    }
    setStatus("checking")
    try {
      const me = await adminApi.me()
      setUser(me.login)
      setStatus("ok")
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) return
      setError(errorMessage(err))
      setStatus("error")
    }
  }, [router])

  useEffect(() => {
    check()
  }, [check])

  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  if (status === "checking") {
    return (
      <div className="flex min-h-screen items-center justify-center gap-2 text-sm text-white/50">
        <Loader2 className="size-4 animate-spin" />
        Проверка доступа...
      </div>
    )
  }

  if (status === "error") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="text-sm text-red-300">{error}</p>
        <div className="flex gap-2">
          <Button onClick={check}>Повторить</Button>
          <Button variant="outline" onClick={logout}>
            Выйти
          </Button>
        </div>
      </div>
    )
  }

  const nav = (
    <nav className="flex flex-col gap-1">
      {NAV.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`)
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
              active ? "bg-white text-black" : "text-white/70 hover:bg-white/10 hover:text-white",
            )}
          >
            <Icon className="size-4" />
            {label}
          </Link>
        )
      })}
    </nav>
  )

  const footer = (
    <div className="flex flex-col gap-1 border-t border-white/10 pt-4">
      {user && <p className="truncate px-3 pb-2 text-xs text-white/40">Вы вошли как {user}</p>}
      <Link
        href="/"
        target="_blank"
        className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-white/70 hover:bg-white/10 hover:text-white"
      >
        <ExternalLink className="size-4" />
        На сайт
      </Link>
      <button
        onClick={logout}
        className="flex items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-white/70 hover:bg-white/10 hover:text-white"
      >
        <LogOut className="size-4" />
        Выйти
      </button>
    </div>
  )

  return (
    <div className="min-h-screen">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col gap-6 border-r border-white/10 bg-black/60 p-4 md:flex">
        <Link href="/admin/leads" className="px-3 pt-2 text-lg font-semibold tracking-tight">
          Админка
        </Link>
        <div className="flex-1">{nav}</div>
        {footer}
      </aside>

      {/* Mobile topbar */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-white/10 bg-zinc-950/90 px-4 backdrop-blur md:hidden">
        <Link href="/admin/leads" className="font-semibold">
          Админка
        </Link>
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="rounded-md p-2 text-white/80 hover:bg-white/10"
          aria-label="Меню"
        >
          {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </header>
      {menuOpen && (
        <div className="fixed inset-x-0 top-14 z-30 flex flex-col gap-4 border-b border-white/10 bg-zinc-950 p-4 shadow-2xl md:hidden">
          {nav}
          {footer}
        </div>
      )}

      <main className="px-4 py-6 md:ml-60 md:px-8 md:py-10">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>
    </div>
  )
}
