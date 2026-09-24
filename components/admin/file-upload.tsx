"use client"

import { useRef, useState } from "react"
import { FileText, Loader2, Trash2, Upload } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { adminApi, errorMessage, mediaUrl, UPLOAD_MAX_BYTES } from "@/lib/admin-api"
import { cn } from "@/lib/utils"

const IMAGE_ACCEPT = "image/jpeg,image/png,image/webp,image/svg+xml,.jpg,.jpeg,.png,.webp,.svg"
const PDF_ACCEPT = "application/pdf,.pdf"

interface FileUploadProps {
  value: string | null
  onChange: (url: string | null) => void
  kind?: "image" | "file"
  accept?: string
  label?: string
  className?: string
  previewClassName?: string
  stacked?: boolean
}

function isImagePath(path: string) {
  return /\.(jpe?g|png|webp|svg|gif|avif)(\?.*)?$/i.test(path)
}

function fileName(path: string) {
  const clean = path.split("?")[0]
  return decodeURIComponent(clean.substring(clean.lastIndexOf("/") + 1)) || path
}

export function FileUpload({
  value,
  onChange,
  kind = "image",
  accept,
  label,
  className,
  previewClassName,
  stacked = false,
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  const acceptAttr = accept ?? (kind === "image" ? IMAGE_ACCEPT : `${PDF_ACCEPT},${IMAGE_ACCEPT}`)

  async function handleFile(file: File) {
    if (file.size > UPLOAD_MAX_BYTES) {
      toast.error("Файл больше 15 МБ")
      return
    }
    setUploading(true)
    try {
      const { url } = await adminApi.upload(file)
      onChange(url)
      toast.success("Файл загружен")
    } catch (err) {
      toast.error(errorMessage(err))
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ""
    }
  }

  const showImage = value && isImagePath(value)

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <input
        ref={inputRef}
        type="file"
        accept={acceptAttr}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleFile(file)
        }}
      />

      {value ? (
        <div
          className={cn(
            "flex flex-col gap-3 rounded-lg border border-white/10 bg-white/5 p-3",
            !stacked && "sm:flex-row sm:items-center",
          )}
        >
          {showImage ? (
            <a href={mediaUrl(value)} target="_blank" rel="noreferrer" className="shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={mediaUrl(value)}
                alt=""
                className={cn(
                  "w-full rounded-md bg-black/40",
                  stacked ? "h-44 object-cover" : "h-28 object-contain sm:w-40",
                  previewClassName,
                )}
              />
            </a>
          ) : (
            <a
              href={mediaUrl(value)}
              target="_blank"
              rel="noreferrer"
              className="flex min-w-0 items-center gap-2 text-sm text-white/80 hover:text-white"
            >
              <FileText className="size-8 shrink-0 text-white/50" />
              <span className="truncate">{fileName(value)}</span>
            </a>
          )}
          <div className={cn("flex flex-wrap gap-2", !stacked && "sm:ml-auto")}>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={uploading}
              onClick={() => inputRef.current?.click()}
            >
              {uploading ? <Loader2 className="animate-spin" /> : <Upload />}
              Заменить
            </Button>
            <Button type="button" variant="destructive" size="sm" disabled={uploading} onClick={() => onChange(null)}>
              <Trash2 />
              Удалить
            </Button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault()
            const file = e.dataTransfer.files?.[0]
            if (file) handleFile(file)
          }}
          className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-white/15 bg-white/[0.03] px-4 py-6 text-sm text-white/50 transition hover:border-white/30 hover:text-white/80 disabled:opacity-60"
        >
          {uploading ? <Loader2 className="size-5 animate-spin" /> : <Upload className="size-5" />}
          <span>{uploading ? "Загрузка..." : (label ?? (kind === "image" ? "Загрузить изображение" : "Загрузить файл"))}</span>
          <span className="text-xs text-white/30">
            {kind === "image" ? "JPG, PNG, WEBP, SVG" : "PDF, JPG, PNG, WEBP, SVG"} · до 15 МБ
          </span>
        </button>
      )}
    </div>
  )
}
