"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field } from "@/components/admin/ui"
import { adminApi, errorMessage, getToken, setToken } from "@/lib/admin-api"

export default function AdminLoginPage() {
  const router = useRouter()
  const [login, setLogin] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (getToken()) router.replace("/admin/leads")
  }, [router])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const { token } = await adminApi.login(login.trim(), password)
      setToken(token)
      router.replace("/admin/leads")
    } catch (err) {
      setError(errorMessage(err))
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm rounded-2xl border border-white/10 bg-white/5 p-6 shadow-2xl sm:p-8"
      >
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-white/10">
            <Lock className="size-5" />
          </div>
          <h1 className="text-xl font-semibold">Вход в админку</h1>
        </div>

        <div className="flex flex-col gap-4">
          <Field label="Логин" htmlFor="login">
            <Input
              id="login"
              autoComplete="username"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              required
              autoFocus
            />
          </Field>
          <Field label="Пароль" htmlFor="password">
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </Field>

          {error && (
            <p className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">{error}</p>
          )}

          <Button type="submit" disabled={loading} className="mt-2 w-full">
            {loading && <Loader2 className="animate-spin" />}
            Войти
          </Button>
        </div>
      </form>
    </div>
  )
}
