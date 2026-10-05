"use client"

import { Check } from "lucide-react"

import { cn } from "@/lib/utils"

interface GroupedOptionPickerItemProps {
  label: string
  hint?: string
  isSelected: boolean
  onSelect: () => void
}

export function GroupedOptionPickerItem({
  label,
  hint,
  isSelected,
  onSelect,
}: GroupedOptionPickerItemProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className="flex w-full items-center gap-2 px-2.5 py-1.5 text-xs hover:bg-accent hover:text-accent-foreground"
    >
      <Check
        className={cn(
          "size-3.5 shrink-0",
          isSelected ? "opacity-100" : "opacity-0"
        )}
      />
      <span className="min-w-0 flex-1 truncate text-left">{label}</span>
      {hint ? (
        <span className="shrink-0 text-[10px] text-muted-foreground">
          {hint}
        </span>
      ) : null}
    </button>
  )
}
