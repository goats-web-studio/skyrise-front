import { Loader2 } from "lucide-react"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

// Dialog/Popover content is rendered in a portal outside the admin wrapper,
// so it needs its own "dark" class to pick up the dark CSS variables.
export const adminDialogClass =
  "dark bg-zinc-950 text-white border-white/10 max-h-[calc(100dvh-2rem)] overflow-y-auto"

export const cardClass = "rounded-xl border border-white/10 bg-white/5"

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string
  description?: string
  actions?: React.ReactNode
}) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {description && <p className="mt-1 text-sm text-white/50">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  )
}

export function Field({
  label,
  htmlFor,
  hint,
  className,
  children,
}: {
  label: string
  htmlFor?: string
  hint?: React.ReactNode
  className?: string
  children: React.ReactNode
}) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <Label htmlFor={htmlFor} className="text-white/80">
        {label}
      </Label>
      {children}
      {hint && <p className="text-xs text-white/40">{hint}</p>}
    </div>
  )
}

export function LoadingState({ label = "Загрузка..." }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-2 py-16 text-sm text-white/50">
      <Loader2 className="size-4 animate-spin" />
      {label}
    </div>
  )
}

export function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <div className={cn(cardClass, "px-6 py-16 text-center text-sm text-white/50")}>{children}</div>
  )
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-6 py-8 text-center text-sm text-red-200">
      <p>{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="mt-3 text-white underline underline-offset-4 hover:text-white/80">
          Повторить
        </button>
      )}
    </div>
  )
}
