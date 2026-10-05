"use client"

import type { ComponentProps } from "react"

import { Filter } from "lucide-react"

import { cn } from "@/lib/utils"

interface FilterIconButtonProps extends Omit<
  ComponentProps<"button">,
  "children"
> {
  label: string
}

export function FilterIconButton({
  label,
  type = "button",
  className,
  ...props
}: FilterIconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      className={cn("text-muted-foreground hover:text-foreground", className)}
      {...props}
    >
      <Filter className="h-3 w-3" />
    </button>
  )
}
