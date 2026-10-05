"use client"

import { ChevronsDown, ChevronsUp } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface ExpandCollapseAllProps {
  disabled?: boolean
  onExpandAll: () => void
  onCollapseAll: () => void
}

export function ExpandCollapseAll({
  disabled = false,
  onExpandAll,
  onCollapseAll,
}: ExpandCollapseAllProps) {
  return (
    <TooltipProvider>
      <div className="flex items-center gap-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              disabled={disabled}
              onClick={onExpandAll}
              aria-label="Expand all sections"
              className="text-muted-foreground hover:text-foreground"
            >
              <ChevronsDown className="h-3.5 w-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent sideOffset={6}>Expand all</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              disabled={disabled}
              onClick={onCollapseAll}
              aria-label="Collapse all sections"
              className="text-muted-foreground hover:text-foreground"
            >
              <ChevronsUp className="h-3.5 w-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent sideOffset={6}>Collapse all</TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  )
}
