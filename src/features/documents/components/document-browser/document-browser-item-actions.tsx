"use client"

import { MoreHorizontal, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

interface DocumentBrowserItemActionsProps {
  title: string
  isSelected: boolean
  isDeleting: boolean
  onDelete: () => void
}

export function DocumentBrowserItemActions({
  title,
  isSelected,
  isDeleting,
  onDelete,
}: DocumentBrowserItemActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon-xs"
          disabled={isDeleting}
          className={cn(
            "absolute top-2 right-2 h-6 w-6",
            isSelected
              ? "opacity-100"
              : "opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
          )}
          aria-label={`Open actions for ${title}`}
        >
          <MoreHorizontal className="h-3.5 w-3.5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={onDelete}
          className="text-destructive focus:text-destructive"
        >
          <Trash2 className="mr-2 h-3.5 w-3.5" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
