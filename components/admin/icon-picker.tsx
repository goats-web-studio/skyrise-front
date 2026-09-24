"use client"

import { useState } from "react"
import {
  Award,
  Box,
  Building2,
  ChevronDown,
  Clock,
  Cog,
  Cpu,
  Factory,
  Gauge,
  Globe,
  Layers,
  Shield,
  TestTube,
  Users,
  Wrench,
  Zap,
  type LucideIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"

export const STAT_ICONS: Record<string, LucideIcon> = {
  Building2,
  Factory,
  Cpu,
  Cog,
  Box,
  TestTube,
  Clock,
  Users,
  Layers,
  Award,
  Shield,
  Globe,
  Zap,
  Gauge,
  Wrench,
}

export const STAT_ICON_NAMES = Object.keys(STAT_ICONS)

export function StatIcon({ name, className }: { name: string; className?: string }) {
  const Icon = STAT_ICONS[name] ?? Box
  return <Icon className={className} />
}

export function IconPicker({ value, onChange }: { value: string; onChange: (name: string) => void }) {
  const [open, setOpen] = useState(false)
  const known = value in STAT_ICONS

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex h-9 items-center gap-2 rounded-md border border-input bg-input/30 px-3 text-sm hover:bg-input/50"
      >
        <StatIcon name={value} className="size-4" />
        <span className={cn("flex-1 text-left", !known && "text-white/40")}>{known ? value : "Выберите иконку"}</span>
        <ChevronDown className={cn("size-4 text-white/40 transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <div className="grid grid-cols-5 gap-1 rounded-md border border-white/10 bg-black/40 p-2 sm:grid-cols-8">
          {STAT_ICON_NAMES.map((name) => {
            const Icon = STAT_ICONS[name]
            return (
              <button
                key={name}
                type="button"
                title={name}
                onClick={() => {
                  onChange(name)
                  setOpen(false)
                }}
                className={cn(
                  "flex aspect-square items-center justify-center rounded-md transition-colors",
                  name === value ? "bg-white text-black" : "text-white/70 hover:bg-white/10 hover:text-white",
                )}
              >
                <Icon className="size-4" />
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
