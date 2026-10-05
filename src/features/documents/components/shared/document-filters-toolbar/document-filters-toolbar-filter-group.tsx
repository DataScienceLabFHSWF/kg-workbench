"use client"

import type { ReactNode } from "react"
import type { LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"

export function DocumentFiltersToolbarFilterGroup({
  title,
  icon: Icon,
  children,
  className,
}: {
  title: string
  icon?: LucideIcon
  children: ReactNode
  className?: string
}) {
  return (
    <section
      className={cn(
        "relative h-full min-w-0 rounded-xl border border-border/70 bg-gradient-to-b from-background to-muted/20 px-3 pt-4 pb-3 shadow-[0_1px_2px_rgba(15,23,42,0.04)]",
        className
      )}
    >
      <div className="absolute top-0 left-3 -translate-y-1/2 bg-background px-1 text-xs font-semibold text-foreground">
        <span className="flex items-center gap-1.5">
          {Icon ? <Icon className="size-3 text-muted-foreground" /> : null}
          <span>{title}</span>
        </span>
      </div>
      {children}
    </section>
  )
}
