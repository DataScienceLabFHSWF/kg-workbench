"use client"

import { Check } from "lucide-react"

import { cn } from "@/lib/utils"

type ClassPickerItemProps = {
  label: string
  hint?: string
  isSelected: boolean
  disabled?: boolean
  onSelect: () => void
}

export function ClassPickerItem({
  label,
  hint,
  isSelected,
  disabled = false,
  onSelect,
}: ClassPickerItemProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={disabled}
      className={cn(
        "flex w-full items-center gap-2 px-2.5 py-1.5 text-xs",
        disabled
          ? "cursor-not-allowed text-muted-foreground/70"
          : "hover:bg-accent hover:text-accent-foreground"
      )}
    >
      <Check
        className={cn(
          "size-3.5 shrink-0",
          isSelected ? "opacity-100" : "opacity-0"
        )}
      />
      <span className="flex-1 truncate text-left">{label}</span>
      {hint && (
        <span className="shrink-0 text-[10px] text-muted-foreground">
          {hint}
        </span>
      )}
    </button>
  )
}
