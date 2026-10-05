"use client"

import { useEffect, useRef, useState, useTransition } from "react"
import { Pencil } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

interface EditableFieldProps {
  value: string
  onSave: (newValue: string) => Promise<unknown>
  as?: "input" | "textarea"
  label?: string
  placeholder?: string
  className?: string
}

export function EditableField({
  value,
  onSave,
  as = "input",
  label,
  placeholder,
  className,
}: EditableFieldProps) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)
  const [isPending, startTransition] = useTransition()
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null)

  useEffect(() => {
    setDraft(value)
  }, [value])

  useEffect(() => {
    if (editing) inputRef.current?.focus()
  }, [editing])

  function save() {
    setEditing(false)
    const trimmed = draft.trim()
    if (trimmed === value) return
    startTransition(async () => {
      await onSave(trimmed)
    })
  }

  function cancel() {
    setEditing(false)
    setDraft(value)
  }

  if (!editing) {
    return (
      <div className={cn("group", className)}>
        {label && (
          <p className="mb-1 text-xs font-medium text-muted-foreground">
            {label}
          </p>
        )}
        <button
          type="button"
          onClick={() => setEditing(true)}
          className={cn(
            "flex w-full items-start gap-2 rounded-md px-2 py-1 text-left text-sm hover:bg-muted",
            isPending && "opacity-60"
          )}
        >
          <span className={cn("flex-1", !value && "text-muted-foreground")}>
            {value || placeholder || "Empty"}
          </span>
          <Pencil className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground opacity-0 group-hover:opacity-100" />
        </button>
      </div>
    )
  }

  const sharedProps = {
    value: draft,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setDraft(e.target.value),
    onBlur: save,
    onKeyDown: (
      e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
      if (e.key === "Enter" && as === "input") save()
      if (e.key === "Escape") cancel()
    },
    placeholder,
    className: "text-sm",
  }

  return (
    <div className={className}>
      {label && (
        <p className="mb-1 text-xs font-medium text-muted-foreground">
          {label}
        </p>
      )}
      {as === "textarea" ? (
        <Textarea
          ref={inputRef as React.RefObject<HTMLTextAreaElement>}
          rows={3}
          {...sharedProps}
        />
      ) : (
        <Input
          ref={inputRef as React.RefObject<HTMLInputElement>}
          {...sharedProps}
        />
      )}
    </div>
  )
}
