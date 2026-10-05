"use client"

import type { ReactNode } from "react"

import { CollapsibleSidePanel } from "@/components/shared/collapsible-side-panel"
import { ScrollArea } from "@/components/ui/scroll-area"

interface DetailPanelShellProps {
  title: string
  isVisual: boolean
  isCollapsed: boolean
  onCollapse: () => void
  onExpand: () => void
  children: ReactNode
}

export function DetailPanelShell({
  title,
  isVisual,
  isCollapsed,
  onCollapse,
  onExpand,
  children,
}: DetailPanelShellProps) {
  const [label, entityName] = title.split(": ", 2)

  return (
    <CollapsibleSidePanel
      side="right"
      title={
        entityName ? (
          <div className="space-y-0.5">
            <p className="text-[10px] font-medium tracking-[0.12em] text-muted-foreground uppercase">
              {label}
            </p>
            <h2 className="truncate text-base leading-none font-semibold text-foreground">
              {entityName}
            </h2>
          </div>
        ) : (
          <div className="space-y-0.5">
            <p className="text-[10px] font-medium tracking-[0.12em] text-muted-foreground uppercase">
              Details
            </p>
            <h2 className="truncate text-base leading-none font-semibold text-foreground">
              Select an item
            </h2>
          </div>
        )
      }
      widthClassName={isVisual ? "w-[32rem]" : "flex-1"}
      isCollapsed={isCollapsed}
      isCollapsible={isVisual}
      showHeader
      headerClassName="min-h-[3.5rem] items-start bg-muted/10 px-4 py-2"
      expandTitle="Show details"
      collapseTitle="Hide details"
      onExpand={onExpand}
      onCollapse={onCollapse}
    >
      <ScrollArea className="min-h-0 flex-1">{children}</ScrollArea>
    </CollapsibleSidePanel>
  )
}
