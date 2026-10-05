"use client"

import type { ComponentProps } from "react"

import { ArrowUpRight } from "lucide-react"

import { cn } from "@/lib/utils"

interface GoToIconButtonProps extends Omit<
  ComponentProps<"button">,
  "children"
> {
  label: string
}

export function GoToIconButton({
  label,
  type = "button",
  className,
  ...props
}: GoToIconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      className={cn("text-muted-foreground hover:text-foreground", className)}
      {...props}
    >
      <ArrowUpRight className="h-3 w-3" />
    </button>
  )
}
