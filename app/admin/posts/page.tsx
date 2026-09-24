"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { ExternalLink, Pencil, Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { ConfirmDialog } from "@/components/admin/confirm-dialog"
import { PostStatusBadge } from "@/components/admin/post-form"
import { cardClass, EmptyState, ErrorState, LoadingState, PageHeader } from "@/components/admin/ui"
import { adminApi, errorMessage, formatDate, mediaUrl, type PostListItem } from "@/lib/admin-api"
import { cn } from "@/lib/utils"

export default function PostsPage() {
  const [posts, setPosts] = useState<PostListItem[] | null>(null)
  const [error, setError] = useState("")
  const [toDelete, setToDelete] = useState<PostListItem | null>(null)
  const [deleting, setDeleting] = useState(false)

  const load = useCallback(async () => {
    setError("")
    try {
      const list = await adminApi.listPosts()
      setPosts(
        [...list].sort((a, b) => new Date(b.publishedAt ?? 0).getTime() - new Date(a.publishedAt ?? 0).getTime()),
      )
    } catch (err) {
      setError(errorMessage(err))
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  async function confirmDelete() {
    if (!toDelete) return
    setDeleting(true)
    try {
      await adminApi.deletePost(toDelete.id)
      setPosts((prev) => prev?.filter((p) => p.id !== toDelete.id) ?? null)
      toast.success("Пост удалён")
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
        title="Блог"
        description={posts ? `Постов: ${posts.length}` : undefined}
        actions={
          <Button asChild>
            <Link href="/admin/posts/new">
              <Plus />
              Новый пост
            </Link>
          </Button>
        }
      />

      {error ? (
        <ErrorState message={error} onRetry={load} />
      ) : !posts ? (
        <LoadingState />
      ) : posts.length === 0 ? (
        <EmptyState>Постов пока нет</EmptyState>
      ) : (
        <div className="flex flex-col gap-3">
          {posts.map((p) => (
            <div key={p.id} className={cn(cardClass, "flex flex-col gap-4 p-3 sm:flex-row sm:items-center")}>
              <Link
                href={`/admin/posts/${p.id}`}
                className="flex min-w-0 flex-1 items-center gap-4"
              >
                <div className="hidden h-16 w-24 shrink-0 overflow-hidden rounded-md bg-black/40 sm:block">
                  {p.coverImage && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={mediaUrl(p.coverImage)} alt="" className="size-full object-cover" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 font-medium hover:underline">{p.title || "Без заголовка"}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-white/50">
                    <PostStatusBadge published={p.isPublished} />
                    <span>{formatDate(p.publishedAt)}</span>
                    {p.readTime && <span>{p.readTime}</span>}
                    <span className="truncate font-mono text-white/30">/{p.slug}</span>
                  </div>
                </div>
              </Link>
              <div className="flex shrink-0 gap-1">
                {p.isPublished && (
                  <Button variant="ghost" size="icon-sm" asChild aria-label="Открыть на сайте">
                    <a href={`/blog/${p.slug}`} target="_blank" rel="noreferrer">
                      <ExternalLink />
                    </a>
                  </Button>
                )}
                <Button variant="ghost" size="icon-sm" asChild aria-label="Редактировать">
                  <Link href={`/admin/posts/${p.id}`}>
                    <Pencil />
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="text-white/50 hover:text-red-300"
                  onClick={() => setToDelete(p)}
                  aria-label="Удалить"
                >
                  <Trash2 />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(v) => !v && setToDelete(null)}
        title="Удалить пост?"
        description={toDelete ? `Пост «${toDelete.title}» будет удалён без возможности восстановления.` : undefined}
        loading={deleting}
        onConfirm={confirmDelete}
      />
    </>
  )
}
