"use client"

import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

interface TabToolbarProps {
  children: ReactNode
  className?: string
}

export function TabToolbar({ children, className }: TabToolbarProps) {
  return (
    <div className={cn("shrink-0 border-b bg-background px-3 py-2", className)}>
      {children}
    </div>
  )
}
