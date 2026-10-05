"use client"

import { useRef, useState } from "react"

import { Textarea } from "@/components/ui/textarea"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { truncateWithEllipsis } from "@/lib/truncate-with-ellipsis"
import { cn } from "@/lib/utils"

const DEFAULT_PREVIEW_LENGTH = 25

interface InlineEditTextProps {
  value: string
  disabled?: boolean
  onSave: (newValue: string) => void
  className?: string
  previewLength?: number
  placeholder?: string
}

export function InlineEditText({
  value,
  disabled,
  onSave,
  className,
  previewLength = DEFAULT_PREVIEW_LENGTH,
  placeholder = "Click to add value",
}: InlineEditTextProps) {
  const [editing, setEditing] = useState(false)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const previewValue = truncateWithEllipsis(value, previewLength)
  const isTruncated = previewValue !== value

  function startEdit() {
    if (disabled) return
    setEditing(true)
    setTimeout(() => inputRef.current?.select(), 0)
  }

  function commit() {
    const newVal = inputRef.current?.value ?? value
    setEditing(false)
    if (newVal.trim() && newVal.trim() !== value) {
      onSave(newVal.trim())
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      commit()
    } else if (e.key === "Escape") {
      setEditing(false)
    }
  }

  if (editing) {
    return (
      <Textarea
        ref={inputRef}
        defaultValue={value}
        onBlur={commit}
        onKeyDown={handleKeyDown}
        rows={3}
        className={cn("min-h-16 px-1 py-1 text-[11px]", className)}
        autoFocus
      />
    )
  }

  const content = (
    <span
      role="button"
      tabIndex={disabled ? -1 : 0}
      onClick={startEdit}
      onKeyDown={(e) => e.key === "Enter" && startEdit()}
      title={isTruncated ? undefined : "Click to rename"}
      className={cn(
        "line-clamp-2 cursor-text rounded px-0.5 transition-colors hover:bg-muted/60",
        !value && "text-muted-foreground italic",
        disabled && "cursor-default opacity-60",
        className
      )}
    >
      {value ? previewValue : placeholder}
    </span>
  )

  if (!isTruncated) {
    return content
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>{content}</TooltipTrigger>
      <TooltipContent side="top" align="start" className="max-w-80 text-xs">
        {value}
      </TooltipContent>
    </Tooltip>
  )
}
