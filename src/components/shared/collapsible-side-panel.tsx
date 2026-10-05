"use client"

import type { ReactNode } from "react"

import {
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface CollapsibleSidePanelProps {
  side: "left" | "right"
  title: ReactNode
  widthClassName: string
  isCollapsed: boolean
  isCollapsible?: boolean
  showHeader?: boolean
  expandTitle: string
  collapseTitle: string
  onExpand: () => void
  onCollapse: () => void
  className?: string
  headerClassName?: string
  children: ReactNode
}

export function CollapsibleSidePanel({
  side,
  title,
  widthClassName,
  isCollapsed,
  isCollapsible = true,
  showHeader = true,
  expandTitle,
  collapseTitle,
  onExpand,
  onCollapse,
  className,
  headerClassName,
  children,
}: CollapsibleSidePanelProps) {
  const isLeft = side === "left"
  const OpenIcon = isLeft ? PanelLeftOpen : PanelRightOpen
  const CloseIcon = isLeft ? PanelLeftClose : PanelRightClose

  if (isCollapsible && isCollapsed) {
    return (
      <div
        className={cn(
          "flex w-9 shrink-0 flex-col items-center pt-2",
          isLeft ? "border-r" : "border-l"
        )}
      >
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={onExpand}
          title={expandTitle}
        >
          <OpenIcon className="h-3.5 w-3.5" />
        </Button>
      </div>
    )
  }

  return (
    <div
      className={cn(
        "flex shrink-0 flex-col overflow-hidden",
        isLeft ? "border-r" : "border-l",
        widthClassName,
        className
      )}
    >
      {showHeader ? (
        <div
          className={cn(
            "flex h-8 shrink-0 items-center justify-between border-b px-3",
            headerClassName
          )}
        >
          <div className="min-w-0 flex-1">{title}</div>
          {isCollapsible ? (
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={onCollapse}
              title={collapseTitle}
            >
              <CloseIcon className="h-3.5 w-3.5" />
            </Button>
          ) : null}
        </div>
      ) : null}

      {children}
    </div>
  )
}
