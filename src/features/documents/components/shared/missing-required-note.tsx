"use client"

import { Info } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface MissingRequiredNoteProps {
  fieldNames: string[]
}

export function MissingRequiredNote({ fieldNames }: MissingRequiredNoteProps) {
  if (fieldNames.length === 0) {
    return null
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          className="size-4 rounded-full text-amber-800 hover:bg-amber-100 hover:text-amber-900"
        >
          <Info className="size-3" />
          <span className="sr-only">Show missing required fields</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent align="start" className="max-w-72 text-xs">
        Missing required fields: {fieldNames.join(", ")}
      </TooltipContent>
    </Tooltip>
  )
}
