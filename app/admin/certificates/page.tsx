"use client"

import { useCallback, useEffect, useState } from "react"
import { FileText, Loader2, Pencil, Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ConfirmDialog } from "@/components/admin/confirm-dialog"
import { FileUpload } from "@/components/admin/file-upload"
import {
  adminDialogClass,
  cardClass,
  EmptyState,
  ErrorState,
  Field,
  LoadingState,
  PageHeader,
} from "@/components/admin/ui"
import { adminApi, errorMessage, mediaUrl, type Certificate, type CertificateInput } from "@/lib/admin-api"
import { cn } from "@/lib/utils"

type FormState = Omit<CertificateInput, "sortOrder"> & { sortOrder: string }

function emptyForm(sortOrder = 0): FormState {
  return { title: "", description: "", image: null, file: null, sortOrder: String(sortOrder) }
}

export default function CertificatesPage() {
  const [items, setItems] = useState<Certificate[] | null>(null)
  const [error, setError] = useState("")
  const [editing, setEditing] = useState<Certificate | "new" | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm())
  const [saving, setSaving] = useState(false)
  const [toDelete, setToDelete] = useState<Certificate | null>(null)
  const [deleting, setDeleting] = useState(false)

  const load = useCallback(async () => {
    setError("")
    try {
      const list = await adminApi.listCertificates()
      setItems([...list].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)))
    } catch (err) {
      setError(errorMessage(err))
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  function openNew() {
    const maxOrder = items?.reduce((m, c) => Math.max(m, c.sortOrder ?? 0), 0) ?? 0
    setForm(emptyForm(items?.length ? maxOrder + 1 : 0))
    setEditing("new")
  }

  function openEdit(c: Certificate) {
    setForm({
      title: c.title ?? "",
      description: c.description ?? "",
      image: c.image ?? null,
      file: c.file ?? null,
      sortOrder: String(c.sortOrder ?? 0),
    })
    setEditing(c)
  }

  async function save(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim()) {
      toast.error("Укажите название")
      return
    }
    const payload: CertificateInput = { ...form, title: form.title.trim(), sortOrder: Number(form.sortOrder) || 0 }
    setSaving(true)
    try {
      if (editing === "new") {
        await adminApi.createCertificate(payload)
        toast.success("Сертификат создан")
      } else if (editing) {
        await adminApi.updateCertificate(editing.id, payload)
        toast.success("Сертификат сохранён")
      }
      setEditing(null)
      load()
    } catch (err) {
      toast.error(errorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  async function confirmDelete() {
    if (!toDelete) return
    setDeleting(true)
    try {
      await adminApi.deleteCertificate(toDelete.id)
      setItems((prev) => prev?.filter((c) => c.id !== toDelete.id) ?? null)
      toast.success("Сертификат удалён")
      setToDelete(null)
    } catch (err) {
      toast.error(errorMessage(err))
    } finally {
      setDeleting(false)
    }
  }

  return (
    <>
      <PageHeader
        title="Сертификаты"
        actions={
          <Button onClick={openNew}>
            <Plus />
            Добавить сертификат
          </Button>
        }
      />

      {error ? (
        <ErrorState message={error} onRetry={load} />
      ) : !items ? (
        <LoadingState />
      ) : items.length === 0 ? (
        <EmptyState>Сертификатов пока нет</EmptyState>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((c) => (
            <div key={c.id} className={cn(cardClass, "flex flex-col overflow-hidden")}>
              <div className="flex aspect-[4/3] items-center justify-center bg-black/40">
                {c.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={mediaUrl(c.image)} alt={c.title} className="size-full object-contain" />
                ) : (
                  <span className="text-xs text-white/30">Нет изображения</span>
                )}
              </div>
              <div className="flex flex-1 flex-col gap-3 p-4">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold">{c.title}</h3>
                    <span className="shrink-0 text-xs text-white/30">#{c.sortOrder}</span>
                  </div>
                  {c.description && <p className="mt-1 line-clamp-3 text-sm text-white/60">{c.description}</p>}
                </div>
                {c.file && (
                  <a
                    href={mediaUrl(c.file)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-white/60 hover:text-white"
                  >
                    <FileText className="size-3.5" />
                    Открыть файл
                  </a>
                )}
                <div className="mt-auto flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => openEdit(c)}>
                    <Pencil />
                    Редактировать
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white/50 hover:text-red-300"
                    onClick={() => setToDelete(c)}
                  >
                    <Trash2 />
                    Удалить
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={!!editing} onOpenChange={(v) => !v && !saving && setEditing(null)}>
        <DialogContent className={`${adminDialogClass} sm:max-w-xl`}>
          <DialogHeader>
            <DialogTitle>{editing === "new" ? "Новый сертификат" : "Редактирование сертификата"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={save} className="flex flex-col gap-5">
            <div className="grid gap-4 sm:grid-cols-[1fr_120px]">
              <Field label="Название" htmlFor="cert-title">
                <Input
                  id="cert-title"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                />
              </Field>
              <Field label="Порядок" htmlFor="cert-order">
                <Input
                  id="cert-order"
                  type="number"
                  value={form.sortOrder}
                  onChange={(e) => setForm({ ...form, sortOrder: e.target.value })}
                />
              </Field>
            </div>
            <Field label="Описание" htmlFor="cert-desc">
              <Textarea
                id="cert-desc"
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </Field>
            <Field label="Изображение (превью)">
              <FileUpload value={form.image} onChange={(image) => setForm({ ...form, image })} />
            </Field>
            <Field label="Файл сертификата" hint="PDF или изображение в полном размере. Необязательно.">
              <FileUpload kind="file" value={form.file} onChange={(file) => setForm({ ...form, file })} />
            </Field>
            <DialogFooter>
              <Button type="button" variant="outline" disabled={saving} onClick={() => setEditing(null)}>
                Отмена
              </Button>
              <Button type="submit" disabled={saving}>
                {saving && <Loader2 className="animate-spin" />}
                Сохранить
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(v) => !v && setToDelete(null)}
        title="Удалить сертификат?"
        description={toDelete ? `Сертификат «${toDelete.title}» будет удалён без возможности восстановления.` : undefined}
        loading={deleting}
        onConfirm={confirmDelete}
      />
    </>
  )
}
