"use client"

import {
  ChevronDown,
  Copy,
  Download,
  PanelRightOpen,
  Pencil,
  Trash2,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface ModuleActionsMenuProps {
  moduleName: string
  disabled?: boolean
  onRename: () => void
  onOverview: () => void
  onDuplicate: () => void
  onExport: () => void
  onDelete: () => void
}

export function ModuleActionsMenu({
  moduleName,
  disabled = false,
  onRename,
  onOverview,
  onDuplicate,
  onExport,
  onDelete,
}: ModuleActionsMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          className="absolute top-0.5 right-0.5 z-10 h-4 w-4 min-w-4 text-muted-foreground hover:text-foreground"
          aria-label={`Open actions for ${moduleName}`}
          disabled={disabled}
          onClick={(event) => {
            event.preventDefault()
            event.stopPropagation()
          }}
        >
          <ChevronDown className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="w-44 min-w-44"
        onClick={(event) => event.stopPropagation()}
      >
        <DropdownMenuItem onClick={onOverview}>
          <PanelRightOpen className="mr-2 h-4 w-4" />
          Overview
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onRename}>
          <Pencil className="mr-2 h-4 w-4" />
          Rename
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onDuplicate}>
          <Copy className="mr-2 h-4 w-4" />
          Duplicate
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onExport}>
          <Download className="mr-2 h-4 w-4" />
          Export JSON
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={onDelete}>
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
