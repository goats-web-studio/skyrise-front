"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import ReactMarkdown from "react-markdown"
import { ArrowLeft, Check, ExternalLink, Loader2, Save, Search, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ConfirmDialog } from "@/components/admin/confirm-dialog"
import { FileUpload } from "@/components/admin/file-upload"
import { cardClass, ErrorState, Field, LoadingState } from "@/components/admin/ui"
import { adminApi, errorMessage, type Id, type Post, type PostInput, type PostListItem } from "@/lib/admin-api"
import { cn } from "@/lib/utils"

export function PostStatusBadge({ published }: { published: boolean }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        published
          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
          : "border-amber-500/30 bg-amber-500/10 text-amber-200",
      )}
    >
      {published ? "Опубликован" : "Черновик"}
    </Badge>
  )
}

interface FormState {
  slug: string
  title: string
  excerpt: string
  content: string
  coverImage: string | null
  publishedAt: string // datetime-local value
  readTime: string
  keywords: string // comma separated
  seoTitle: string
  seoDescription: string
  relatedSlugs: string[]
  isPublished: boolean
}

function pad(n: number) {
  return String(n).padStart(2, "0")
}

function toLocalInput(iso: string | null | undefined): string {
  if (!iso) return ""
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ""
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function fromLocalInput(value: string): string | null {
  if (!value) return null
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? null : d.toISOString()
}

function emptyForm(): FormState {
  return {
    slug: "",
    title: "",
    excerpt: "",
    content: "",
    coverImage: null,
    publishedAt: toLocalInput(new Date().toISOString()),
    readTime: "",
    keywords: "",
    seoTitle: "",
    seoDescription: "",
    relatedSlugs: [],
    isPublished: false,
  }
}

function toForm(p: Post): FormState {
  return {
    slug: p.slug ?? "",
    title: p.title ?? "",
    excerpt: p.excerpt ?? "",
    content: p.content ?? "",
    coverImage: p.coverImage ?? null,
    publishedAt: toLocalInput(p.publishedAt),
    readTime: p.readTime ?? "",
    keywords: (p.keywords ?? []).join(", "),
    seoTitle: p.seoTitle ?? "",
    seoDescription: p.seoDescription ?? "",
    relatedSlugs: p.relatedSlugs ?? [],
    isPublished: !!p.isPublished,
  }
}

function toPayload(f: FormState): PostInput {
  return {
    slug: f.slug.trim(),
    title: f.title.trim(),
    excerpt: f.excerpt.trim(),
    content: f.content,
    coverImage: f.coverImage,
    publishedAt: fromLocalInput(f.publishedAt),
    readTime: f.readTime.trim() || null,
    keywords: f.keywords
      .split(",")
      .map((k) => k.trim())
      .filter(Boolean),
    seoTitle: f.seoTitle.trim(),
    seoDescription: f.seoDescription.trim(),
    relatedSlugs: f.relatedSlugs,
    isPublished: f.isPublished,
  }
}

const markdownClass =
  "text-sm leading-relaxed text-white/80 [&_a]:text-white [&_a]:underline [&_blockquote]:border-l-2 [&_blockquote]:border-white/20 [&_blockquote]:pl-4 [&_blockquote]:text-white/60 [&_code]:rounded [&_code]:bg-white/10 [&_code]:px-1 [&_code]:font-mono [&_h1]:mt-6 [&_h1]:mb-3 [&_h1]:text-2xl [&_h1]:font-semibold [&_h1]:text-white [&_h2]:mt-6 [&_h2]:mb-3 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-white [&_h3]:mt-5 [&_h3]:mb-2 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-white [&_hr]:my-6 [&_hr]:border-white/10 [&_img]:my-4 [&_img]:rounded-lg [&_li]:my-1 [&_ol]:my-3 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:my-3 [&_pre]:my-4 [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:bg-black/50 [&_pre]:p-4 [&_strong]:text-white [&_table]:my-4 [&_table]:w-full [&_td]:border [&_td]:border-white/10 [&_td]:px-2 [&_td]:py-1 [&_th]:border [&_th]:border-white/10 [&_th]:px-2 [&_th]:py-1 [&_ul]:my-3 [&_ul]:list-disc [&_ul]:pl-6"

function RelatedPicker({
  options,
  value,
  onChange,
}: {
  options: PostListItem[]
  value: string[]
  onChange: (v: string[]) => void
}) {
  const [query, setQuery] = useState("")
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return options
    return options.filter((p) => p.title.toLowerCase().includes(q) || p.slug.toLowerCase().includes(q))
  }, [options, query])

  const unknown = value.filter((s) => !options.some((p) => p.slug === s))

  function toggle(slug: string) {
    onChange(value.includes(slug) ? value.filter((s) => s !== slug) : [...value, slug])
  }

  if (options.length === 0 && unknown.length === 0) {
    return <p className="text-sm text-white/40">Других постов пока нет</p>
  }

  return (
    <div className="flex flex-col gap-2">
      {options.length > 6 && (
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-white/30" />
          <Input placeholder="Поиск поста" value={query} onChange={(e) => setQuery(e.target.value)} className="pl-9" />
        </div>
      )}
      <div className="max-h-64 overflow-y-auto rounded-lg border border-white/10 bg-black/20">
        {filtered.map((p) => {
          const checked = value.includes(p.slug)
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => toggle(p.slug)}
              className={cn(
                "flex w-full items-start gap-3 border-b border-white/5 px-3 py-2 text-left text-sm last:border-b-0 hover:bg-white/5",
                checked && "bg-white/[0.07]",
              )}
            >
              <span
                className={cn(
                  "mt-0.5 flex size-4 shrink-0 items-center justify-center rounded border",
                  checked ? "border-white bg-white text-black" : "border-white/30",
                )}
              >
                {checked && <Check className="size-3" />}
              </span>
              <span className="min-w-0">
                <span className="block truncate">{p.title}</span>
                <span className="block truncate font-mono text-xs text-white/30">{p.slug}</span>
              </span>
            </button>
          )
        })}
        {filtered.length === 0 && <p className="px-3 py-2 text-sm text-white/40">Ничего не найдено</p>}
      </div>
      {unknown.length > 0 && (
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="text-white/40">Не найдены:</span>
          {unknown.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => toggle(s)}
              className="rounded border border-amber-500/30 bg-amber-500/10 px-1.5 font-mono text-amber-200 hover:line-through"
              title="Убрать"
            >
              {s}
            </button>
          ))}
        </div>
      )}
      {value.length > 0 && <p className="text-xs text-white/40">Выбрано: {value.length}</p>}
    </div>
  )
}

export function PostForm({ postId }: { postId?: Id }) {
  const router = useRouter()
  const isNew = postId === undefined
  const [form, setForm] = useState<FormState | null>(isNew ? emptyForm() : null)
  const [allPosts, setAllPosts] = useState<PostListItem[]>([])
  const [error, setError] = useState("")
  const [saving, setSaving] = useState(false)
  const [savedSlug, setSavedSlug] = useState<string>("")
  const [savedPublished, setSavedPublished] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const load = useCallback(async () => {
    setError("")
    try {
      const [post, list] = await Promise.all([
        postId === undefined ? Promise.resolve(null) : adminApi.getPost(postId),
        adminApi.listPosts().catch(() => [] as PostListItem[]),
      ])
      setAllPosts(list)
      if (post) {
        setForm(toForm(post))
        setSavedSlug(post.slug)
        setSavedPublished(!!post.isPublished)
      }
    } catch (err) {
      setError(errorMessage(err))
    }
  }, [postId])

  useEffect(() => {
    load()
  }, [load])

  const relatedOptions = useMemo(
    () => allPosts.filter((p) => String(p.id) !== String(postId ?? "")),
    [allPosts, postId],
  )

  if (error) return <ErrorState message={error} onRetry={load} />
  if (!form) return <LoadingState />

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev))
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form) return
    if (!form.title.trim()) {
      toast.error("Укажите заголовок")
      return
    }
    setSaving(true)
    try {
      const payload = toPayload(form)
      if (postId === undefined) {
        const created = await adminApi.createPost(payload)
        toast.success("Пост создан")
        router.replace(`/admin/posts/${created.id}`)
      } else {
        const updated = await adminApi.updatePost(postId, payload)
        toast.success("Пост сохранён")
        if (updated && typeof updated === "object" && "slug" in updated) {
          setForm(toForm(updated))
          setSavedSlug(updated.slug)
          setSavedPublished(!!updated.isPublished)
        }
        setSaving(false)
      }
    } catch (err) {
      toast.error(errorMessage(err))
      setSaving(false)
    }
  }

  async function onDelete() {
    if (postId === undefined) return
    setDeleting(true)
    try {
      await adminApi.deletePost(postId)
      toast.success("Пост удалён")
      router.replace("/admin/posts")
    } catch (err) {
      toast.error(errorMessage(err))
      setDeleting(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <Button type="button" variant="ghost" size="icon" asChild aria-label="Назад">
            <Link href="/admin/posts">
              <ArrowLeft />
            </Link>
          </Button>
          <h1 className="truncate text-2xl font-semibold tracking-tight">{isNew ? "Новый пост" : "Редактирование поста"}</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          {!isNew && savedPublished && savedSlug && (
            <Button type="button" variant="outline" asChild>
              <a href={`/blog/${savedSlug}`} target="_blank" rel="noreferrer">
                <ExternalLink />
                На сайте
              </a>
            </Button>
          )}
          {!isNew && (
            <Button
              type="button"
              variant="outline"
              className="text-red-300 hover:text-red-200"
              onClick={() => setConfirmDelete(true)}
            >
              <Trash2 />
              Удалить
            </Button>
          )}
          <Button type="submit" disabled={saving}>
            {saving ? <Loader2 className="animate-spin" /> : <Save />}
            Сохранить
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Main column */}
        <div className="flex min-w-0 flex-col gap-6">
          <div className={cn(cardClass, "flex flex-col gap-5 p-4 sm:p-5")}>
            <Field label="Заголовок" htmlFor="post-title">
              <Input id="post-title" value={form.title} onChange={(e) => set("title", e.target.value)} required />
            </Field>
            <Field
              label="Слаг (URL)"
              htmlFor="post-slug"
              hint={
                form.slug.trim()
                  ? `Адрес статьи: /blog/${form.slug.trim()}`
                  : "Оставьте пустым: слаг сгенерируется автоматически из заголовка."
              }
            >
              <Input
                id="post-slug"
                className="font-mono"
                placeholder="avtomaticheski-iz-zagolovka"
                value={form.slug}
                onChange={(e) => set("slug", e.target.value)}
              />
            </Field>
            <Field label="Краткое описание (excerpt)" htmlFor="post-excerpt">
              <Textarea id="post-excerpt" rows={3} value={form.excerpt} onChange={(e) => set("excerpt", e.target.value)} />
            </Field>
          </div>

          <div className={cn(cardClass, "flex flex-col gap-3 p-4 sm:p-5")}>
            <Tabs defaultValue="edit">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-medium text-white/80">Текст (Markdown)</span>
                <TabsList>
                  <TabsTrigger value="edit">Редактор</TabsTrigger>
                  <TabsTrigger value="preview">Превью</TabsTrigger>
                </TabsList>
              </div>
              <TabsContent value="edit" className="mt-2">
                <Textarea
                  value={form.content}
                  onChange={(e) => set("content", e.target.value)}
                  rows={24}
                  spellCheck
                  placeholder={"## Заголовок раздела\n\nТекст статьи..."}
                  className="min-h-[420px] font-mono text-sm leading-relaxed"
                />
              </TabsContent>
              <TabsContent value="preview" className="mt-2">
                <div className="min-h-[420px] rounded-md border border-white/10 bg-black/30 px-4 py-2 sm:px-6">
                  {form.content.trim() ? (
                    <div className={markdownClass}>
                      <ReactMarkdown>{form.content}</ReactMarkdown>
                    </div>
                  ) : (
                    <p className="py-4 text-sm text-white/40">Пока пусто</p>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <div className={cn(cardClass, "flex flex-col gap-5 p-4 sm:p-5")}>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-white/50">SEO</h2>
            <Field label="SEO-заголовок" htmlFor="post-seo-title" hint={`${form.seoTitle.length} симв.`}>
              <Input id="post-seo-title" value={form.seoTitle} onChange={(e) => set("seoTitle", e.target.value)} />
            </Field>
            <Field label="SEO-описание" htmlFor="post-seo-desc" hint={`${form.seoDescription.length} симв.`}>
              <Textarea
                id="post-seo-desc"
                rows={3}
                value={form.seoDescription}
                onChange={(e) => set("seoDescription", e.target.value)}
              />
            </Field>
            <Field label="Ключевые слова" htmlFor="post-keywords" hint="Через запятую">
              <Input
                id="post-keywords"
                placeholder="лифт Астана, монтаж лифтов"
                value={form.keywords}
                onChange={(e) => set("keywords", e.target.value)}
              />
            </Field>
          </div>
        </div>

        {/* Side column */}
        <div className="flex min-w-0 flex-col gap-6">
          <div className={cn(cardClass, "flex flex-col gap-5 p-4 sm:p-5")}>
            <div className="flex items-center justify-between gap-3">
              <div className="flex flex-col gap-1">
                <label htmlFor="post-published" className="text-sm font-medium text-white/80">
                  Опубликован
                </label>
                <PostStatusBadge published={form.isPublished} />
              </div>
              <Switch id="post-published" checked={form.isPublished} onCheckedChange={(v) => set("isPublished", v)} />
            </div>
            <Field label="Дата публикации" htmlFor="post-date">
              <Input
                id="post-date"
                type="datetime-local"
                value={form.publishedAt}
                onChange={(e) => set("publishedAt", e.target.value)}
                className="[color-scheme:dark]"
              />
            </Field>
            <Field label="Время чтения" htmlFor="post-readtime" hint="Оставьте пустым: посчитается автоматически.">
              <Input
                id="post-readtime"
                placeholder="например, 8 мин"
                value={form.readTime}
                onChange={(e) => set("readTime", e.target.value)}
              />
            </Field>
          </div>

          <div className={cn(cardClass, "flex flex-col gap-3 p-4 sm:p-5")}>
            <Field label="Обложка">
              <FileUpload
                value={form.coverImage}
                onChange={(v) => set("coverImage", v)}
                stacked
              />
            </Field>
          </div>

          <div className={cn(cardClass, "flex flex-col gap-3 p-4 sm:p-5")}>
            <Field label="Похожие статьи">
              <RelatedPicker
                options={relatedOptions}
                value={form.relatedSlugs}
                onChange={(v) => set("relatedSlugs", v)}
              />
            </Field>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title="Удалить пост?"
        description={`Пост «${form.title || "без заголовка"}» будет удалён без возможности восстановления.`}
        loading={deleting}
        onConfirm={onDelete}
      />
    </form>
  )
}
