"use client"

import { useState, type ReactNode } from "react"
import { ChevronDown, ChevronRight } from "lucide-react"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

interface ExportModuleGroupCardProps {
  title: string
  description: string
  children: ReactNode
  action?: ReactNode
  defaultOpen?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function ExportModuleGroupCard({
  title,
  description,
  children,
  action,
  defaultOpen,
  open,
  onOpenChange,
}: ExportModuleGroupCardProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen ?? false)
  const isControlled = open !== undefined
  const isOpen = isControlled ? open : internalOpen

  function handleOpenChange(nextOpen: boolean) {
    if (!isControlled) setInternalOpen(nextOpen)
    onOpenChange?.(nextOpen)
  }

  return (
    <Collapsible open={isOpen} onOpenChange={handleOpenChange}>
      <div className="space-y-3 rounded-md border px-3 py-3">
        <div className="flex items-start justify-between gap-3">
          <CollapsibleTrigger className="flex min-w-0 flex-1 items-start gap-2 text-left hover:text-foreground">
            {isOpen ? (
              <ChevronDown className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            ) : (
              <ChevronRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            )}
            <div className="min-w-0">
              <p className="truncate font-medium">{title}</p>
              <p className="text-muted-foreground">{description}</p>
            </div>
          </CollapsibleTrigger>
          {action}
        </div>

        <CollapsibleContent className="space-y-3">
          {children}
        </CollapsibleContent>
      </div>
    </Collapsible>
  )
}
