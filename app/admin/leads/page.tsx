"use client"

import { useCallback, useEffect, useState } from "react"
import { Mail, MessageCircle, Phone, RefreshCw, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ConfirmDialog } from "@/components/admin/confirm-dialog"
import { cardClass, EmptyState, ErrorState, LoadingState, PageHeader } from "@/components/admin/ui"
import { adminApi, errorMessage, formatDateTime, type Lead } from "@/lib/admin-api"
import { cn } from "@/lib/utils"

function waLink(phone: string) {
  const digits = phone.replace(/\D/g, "")
  const normalized = digits.length === 11 && digits.startsWith("8") ? `7${digits.slice(1)}` : digits
  return `https://wa.me/${normalized}`
}

function WhatsappBadge({ sent }: { sent: boolean }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "whitespace-nowrap",
        sent ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300" : "border-white/15 bg-white/5 text-white/50",
      )}
    >
      {sent ? "WhatsApp отправлен" : "WhatsApp: нет"}
    </Badge>
  )
}

function Contacts({ lead }: { lead: Lead }) {
  return (
    <div className="flex flex-col gap-1 text-sm">
      {lead.phone && (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <a href={`tel:${lead.phone.replace(/[^\d+]/g, "")}`} className="inline-flex items-center gap-1.5 hover:underline">
            <Phone className="size-3.5 text-white/40" />
            {lead.phone}
          </a>
          <a
            href={waLink(lead.phone)}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-xs text-emerald-300 hover:underline"
          >
            <MessageCircle className="size-3.5" />
            WhatsApp
          </a>
        </div>
      )}
      {lead.email && (
        <a href={`mailto:${lead.email}`} className="inline-flex items-center gap-1.5 break-all hover:underline">
          <Mail className="size-3.5 shrink-0 text-white/40" />
          {lead.email}
        </a>
      )}
      {!lead.phone && !lead.email && <span className="text-white/40">—</span>}
    </div>
  )
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[] | null>(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [toDelete, setToDelete] = useState<Lead | null>(null)
  const [deleting, setDeleting] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      setLeads(await adminApi.listLeads())
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  async function confirmDelete() {
    if (!toDelete) return
    setDeleting(true)
    try {
      await adminApi.deleteLead(toDelete.id)
      setLeads((prev) => prev?.filter((l) => l.id !== toDelete.id) ?? null)
      toast.success("Заявка удалена")
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
        title="Заявки"
        description={leads ? `Всего: ${leads.length}` : undefined}
        actions={
          <Button variant="outline" onClick={load} disabled={loading}>
            <RefreshCw className={cn(loading && "animate-spin")} />
            Обновить
          </Button>
        }
      />

      {error ? (
        <ErrorState message={error} onRetry={load} />
      ) : !leads ? (
        <LoadingState />
      ) : leads.length === 0 ? (
        <EmptyState>Заявок пока нет</EmptyState>
      ) : (
        <>
          {/* Desktop table */}
          <div className={cn(cardClass, "hidden overflow-x-auto lg:block")}>
            <table className="w-full text-left text-sm">
              <thead className="border-b border-white/10 text-xs uppercase tracking-wide text-white/40">
                <tr>
                  <th className="px-4 py-3 font-medium">Дата</th>
                  <th className="px-4 py-3 font-medium">Имя</th>
                  <th className="px-4 py-3 font-medium">Контакты</th>
                  <th className="px-4 py-3 font-medium">Комментарий</th>
                  <th className="px-4 py-3 font-medium">Источник</th>
                  <th className="px-4 py-3 font-medium">WhatsApp</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {leads.map((lead) => (
                  <tr key={lead.id} className="align-top hover:bg-white/[0.03]">
                    <td className="whitespace-nowrap px-4 py-3 text-white/60">{formatDateTime(lead.createdAt)}</td>
                    <td className="px-4 py-3 font-medium">{lead.name || "—"}</td>
                    <td className="px-4 py-3">
                      <Contacts lead={lead} />
                    </td>
                    <td className="max-w-xs whitespace-pre-wrap break-words px-4 py-3 text-white/70">
                      {lead.comment || <span className="text-white/30">—</span>}
                    </td>
                    <td className="px-4 py-3 text-white/60">{lead.source || "—"}</td>
                    <td className="px-4 py-3">
                      <WhatsappBadge sent={lead.whatsappSent} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => setToDelete(lead)}
                        aria-label="Удалить"
                        className="text-white/50 hover:text-red-300"
                      >
                        <Trash2 />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="flex flex-col gap-3 lg:hidden">
            {leads.map((lead) => (
              <div key={lead.id} className={cn(cardClass, "flex flex-col gap-3 p-4")}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium">{lead.name || "Без имени"}</p>
                    <p className="text-xs text-white/40">{formatDateTime(lead.createdAt)}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => setToDelete(lead)}
                    aria-label="Удалить"
                    className="shrink-0 text-white/50 hover:text-red-300"
                  >
                    <Trash2 />
                  </Button>
                </div>
                <Contacts lead={lead} />
                {lead.comment && <p className="whitespace-pre-wrap break-words text-sm text-white/70">{lead.comment}</p>}
                <div className="flex flex-wrap items-center gap-2 text-xs text-white/40">
                  <WhatsappBadge sent={lead.whatsappSent} />
                  {lead.source && <span>Источник: {lead.source}</span>}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(v) => !v && setToDelete(null)}
        title="Удалить заявку?"
        description={toDelete ? `Заявка от «${toDelete.name || "без имени"}» будет удалена без возможности восстановления.` : undefined}
        loading={deleting}
        onConfirm={confirmDelete}
      />
    </>
  )
}
