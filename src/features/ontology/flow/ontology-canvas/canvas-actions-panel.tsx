"use client"

import { ChevronDown, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Panel } from "@xyflow/react"

interface CanvasActionsPanelProps {
  onCreateClass: () => void
  onCreateRelation: () => void
}

export function CanvasActionsPanel({
  onCreateClass,
  onCreateRelation,
}: CanvasActionsPanelProps) {
  return (
    <Panel position="top-left">
      <div className="flex shadow-sm">
        <Button
          size="sm"
          variant="outline"
          className="rounded-r-none border-r-0 shadow-none"
          onClick={onCreateClass}
        >
          <Plus className="mr-1.5 h-3.5 w-3.5" />
          Add class
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="sm"
              variant="outline"
              className="rounded-l-none px-2 shadow-none"
            >
              <ChevronDown className="h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onClick={onCreateClass}>
              Add class
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onCreateRelation}>
              Add relation
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </Panel>
  )
}
