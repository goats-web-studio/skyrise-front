"use client"

import { useCallback, useEffect, useState } from "react"
import { ArrowDown, ArrowUp, Loader2, Pencil, Plus, Trash2, Youtube } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ConfirmDialog } from "@/components/admin/confirm-dialog"
import { FileUpload } from "@/components/admin/file-upload"
import { IconPicker, StatIcon } from "@/components/admin/icon-picker"
import {
  adminDialogClass,
  cardClass,
  EmptyState,
  ErrorState,
  Field,
  LoadingState,
  PageHeader,
} from "@/components/admin/ui"
import { adminApi, errorMessage, mediaUrl, type Brand, type BrandInput, type BrandStat } from "@/lib/admin-api"
import { cn } from "@/lib/utils"

type FormState = Omit<BrandInput, "sortOrder" | "youtubeUrl"> & { sortOrder: string; youtubeUrl: string }

function emptyForm(sortOrder = 0): FormState {
  return { name: "", description: "", youtubeUrl: "", logo: null, stats: [], sortOrder: String(sortOrder) }
}

function toForm(b: Brand): FormState {
  return {
    name: b.name ?? "",
    description: b.description ?? "",
    youtubeUrl: b.youtubeUrl ?? "",
    logo: b.logo ?? null,
    stats: (b.stats ?? []).map((s) => ({ icon: s.icon ?? "Box", value: s.value ?? "", label: s.label ?? "" })),
    sortOrder: String(b.sortOrder ?? 0),
  }
}

function StatsEditor({ stats, onChange }: { stats: BrandStat[]; onChange: (stats: BrandStat[]) => void }) {
  function update(i: number, patch: Partial<BrandStat>) {
    onChange(stats.map((s, idx) => (idx === i ? { ...s, ...patch } : s)))
  }
  function move(i: number, dir: -1 | 1) {
    const j = i + dir
    if (j < 0 || j >= stats.length) return
    const next = [...stats]
    ;[next[i], next[j]] = [next[j], next[i]]
    onChange(next)
  }

  return (
    <div className="flex flex-col gap-3">
      {stats.length === 0 && <p className="text-sm text-white/40">Показателей пока нет</p>}
      {stats.map((stat, i) => (
        <div key={i} className="flex flex-col gap-3 rounded-lg border border-white/10 bg-white/[0.03] p-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-white/40">Показатель {i + 1}</span>
            <div className="flex gap-1">
              <Button type="button" variant="ghost" size="icon-sm" disabled={i === 0} onClick={() => move(i, -1)} aria-label="Выше">
                <ArrowUp />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                disabled={i === stats.length - 1}
                onClick={() => move(i, 1)}
                aria-label="Ниже"
              >
                <ArrowDown />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="text-white/50 hover:text-red-300"
                onClick={() => onChange(stats.filter((_, idx) => idx !== i))}
                aria-label="Удалить показатель"
              >
                <Trash2 />
              </Button>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-[180px_1fr_1fr]">
            <IconPicker value={stat.icon} onChange={(icon) => update(i, { icon })} />
            <Input placeholder="Значение, напр. 30+" value={stat.value} onChange={(e) => update(i, { value: e.target.value })} />
            <Input placeholder="Подпись, напр. лет на рынке" value={stat.label} onChange={(e) => update(i, { label: e.target.value })} />
          </div>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        className="self-start"
        onClick={() => onChange([...stats, { icon: "Building2", value: "", label: "" }])}
      >
        <Plus />
        Добавить показатель
      </Button>
    </div>
  )
}

export default function BrandsPage() {
  const [brands, setBrands] = useState<Brand[] | null>(null)
  const [error, setError] = useState("")
  const [editing, setEditing] = useState<Brand | "new" | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm())
  const [saving, setSaving] = useState(false)
  const [toDelete, setToDelete] = useState<Brand | null>(null)
  const [deleting, setDeleting] = useState(false)

  const load = useCallback(async () => {
    setError("")
    try {
      const list = await adminApi.listBrands()
      setBrands([...list].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)))
    } catch (err) {
      setError(errorMessage(err))
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  function openNew() {
    const maxOrder = brands?.reduce((m, b) => Math.max(m, b.sortOrder ?? 0), 0) ?? 0
    setForm(emptyForm(brands?.length ? maxOrder + 1 : 0))
    setEditing("new")
  }

  function openEdit(b: Brand) {
    setForm(toForm(b))
    setEditing(b)
  }

  async function save(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) {
      toast.error("Укажите название")
      return
    }
    const payload: BrandInput = {
      ...form,
      name: form.name.trim(),
      youtubeUrl: form.youtubeUrl.trim() || null,
      stats: form.stats.map((s) => ({ icon: s.icon, value: s.value.trim(), label: s.label.trim() })),
      sortOrder: Number(form.sortOrder) || 0,
    }
    setSaving(true)
    try {
      if (editing === "new") {
        await adminApi.createBrand(payload)
        toast.success("Бренд создан")
      } else if (editing) {
        await adminApi.updateBrand(editing.id, payload)
        toast.success("Бренд сохранён")
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
      await adminApi.deleteBrand(toDelete.id)
      setBrands((prev) => prev?.filter((b) => b.id !== toDelete.id) ?? null)
      toast.success("Бренд удалён")
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
        title="Бренды"
        description="Производители, которые показываются на сайте"
        actions={
          <Button onClick={openNew}>
            <Plus />
            Добавить бренд
          </Button>
        }
      />

      {error ? (
        <ErrorState message={error} onRetry={load} />
      ) : !brands ? (
        <LoadingState />
      ) : brands.length === 0 ? (
        <EmptyState>Брендов пока нет</EmptyState>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {brands.map((b) => (
            <div key={b.id} className={cn(cardClass, "flex flex-col gap-4 p-4")}>
              <div className="flex items-start gap-4">
                <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-black/40">
                  {b.logo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={mediaUrl(b.logo)} alt={b.name} className="size-full object-contain p-1" />
                  ) : (
                    <span className="text-xs text-white/30">Нет лого</span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="truncate font-semibold">{b.name}</h3>
                    <span className="shrink-0 text-xs text-white/30">#{b.sortOrder}</span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm text-white/60">{b.description || "Без описания"}</p>
                  {b.youtubeUrl && (
                    <a
                      href={b.youtubeUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-1 inline-flex items-center gap-1 text-xs text-white/50 hover:text-white"
                    >
                      <Youtube className="size-3.5" />
                      Видео
                    </a>
                  )}
                </div>
              </div>
              {b.stats?.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {b.stats.map((s, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-black/30 px-2 py-1 text-xs text-white/70"
                    >
                      <StatIcon name={s.icon} className="size-3.5" />
                      <b className="font-semibold text-white">{s.value}</b>
                      {s.label}
                    </span>
                  ))}
                </div>
              )}
              <div className="mt-auto flex gap-2">
                <Button variant="outline" size="sm" onClick={() => openEdit(b)}>
                  <Pencil />
                  Редактировать
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white/50 hover:text-red-300"
                  onClick={() => setToDelete(b)}
                >
                  <Trash2 />
                  Удалить
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={!!editing} onOpenChange={(v) => !v && !saving && setEditing(null)}>
        <DialogContent className={`${adminDialogClass} sm:max-w-2xl`}>
          <DialogHeader>
            <DialogTitle>{editing === "new" ? "Новый бренд" : "Редактирование бренда"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={save} className="flex flex-col gap-5">
            <div className="grid gap-4 sm:grid-cols-[1fr_120px]">
              <Field label="Название" htmlFor="brand-name">
                <Input
                  id="brand-name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </Field>
              <Field label="Порядок" htmlFor="brand-order">
                <Input
                  id="brand-order"
                  type="number"
                  value={form.sortOrder}
                  onChange={(e) => setForm({ ...form, sortOrder: e.target.value })}
                />
              </Field>
            </div>
            <Field label="Описание" htmlFor="brand-desc">
              <Textarea
                id="brand-desc"
                rows={4}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </Field>
            <Field label="Ссылка на YouTube" htmlFor="brand-yt">
              <Input
                id="brand-yt"
                type="url"
                placeholder="https://www.youtube.com/watch?v=..."
                value={form.youtubeUrl}
                onChange={(e) => setForm({ ...form, youtubeUrl: e.target.value })}
              />
            </Field>
            <Field label="Логотип">
              <FileUpload value={form.logo} onChange={(logo) => setForm({ ...form, logo })} />
            </Field>
            <Field label="Показатели">
              <StatsEditor stats={form.stats} onChange={(stats) => setForm({ ...form, stats })} />
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
        title="Удалить бренд?"
        description={toDelete ? `Бренд «${toDelete.name}» будет удалён без возможности восстановления.` : undefined}
        loading={deleting}
        onConfirm={confirmDelete}
      />
    </>
  )
}
