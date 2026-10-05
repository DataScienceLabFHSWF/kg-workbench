"use client"

import { ChevronDown, X } from "lucide-react"

import { TruncatedLabel } from "@/components/shared/truncated-label"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

export interface MultiSelectDropdownOption<T extends string = string> {
  value: T
  label: string
}

interface MultiSelectDropdownProps<T extends string> {
  label: string
  options: MultiSelectDropdownOption<T>[]
  selectedValues: ReadonlySet<T>
  onToggle: (value: T) => void
  onToggleAll: () => void
  allLabel?: string
  selectAllValue?: T
  onClear?: () => void
  disabled?: boolean
  hideLabel?: boolean
  className?: string
  isActive?: boolean
  getBadgeClassName?: (option: MultiSelectDropdownOption<T>) => string | null
}

export function MultiSelectDropdown<T extends string>({
  label,
  options,
  selectedValues,
  onToggle,
  onToggleAll,
  allLabel = "All",
  selectAllValue,
  onClear,
  disabled = false,
  hideLabel = false,
  className,
  isActive = false,
  getBadgeClassName,
}: MultiSelectDropdownProps<T>) {
  const selectedOptions = options.filter((option) =>
    selectedValues.has(option.value)
  )
  const hasExplicitAllSelection = selectAllValue
    ? selectedValues.has(selectAllValue)
    : false
  const allSelected =
    hasExplicitAllSelection || selectedOptions.length === options.length

  return (
    <DropdownMenu>
      <div className="group relative">
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            disabled={disabled}
            className={cn(
              "flex min-h-8 min-w-0 items-center gap-2 rounded-md border border-input bg-background px-2 py-1 text-left text-xs",
              "transition-colors hover:border-foreground/40 focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50 focus-visible:outline-none",
              "disabled:cursor-not-allowed disabled:opacity-50",
              isActive &&
                "border-app-selection-border bg-app-selection-surface",
              onClear && isActive && "pr-10",
              className
            )}
          >
            {!hideLabel ? (
              <span className="shrink-0 text-muted-foreground">{label}</span>
            ) : null}
            <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1">
              {allSelected ? (
                <Badge
                  variant="secondary"
                  className="h-5 max-w-full min-w-0 overflow-hidden rounded-sm px-1.5 text-[10px]"
                >
                  <TruncatedLabel text={allLabel} />
                </Badge>
              ) : selectedOptions.length > 0 ? (
                selectedOptions.map((option) => (
                  <Badge
                    key={option.value}
                    variant="secondary"
                    className={cn(
                      "h-5 max-w-full min-w-0 overflow-hidden rounded-sm px-1.5 text-[10px]",
                      getBadgeClassName?.(option)
                    )}
                  >
                    <TruncatedLabel text={option.label} />
                  </Badge>
                ))
              ) : (
                <span className="text-muted-foreground">None selected</span>
              )}
            </div>
            <ChevronDown className="size-3.5 shrink-0 text-muted-foreground" />
          </button>
        </DropdownMenuTrigger>

        {onClear && isActive ? (
          <button
            type="button"
            className="absolute top-1/2 right-6 inline-flex size-4 -translate-y-1/2 items-center justify-center rounded-sm text-muted-foreground opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100 hover:bg-muted hover:text-foreground focus-visible:opacity-100 focus-visible:outline-none"
            aria-label={`Clear ${label}`}
            onMouseDown={(event) => event.preventDefault()}
            onClick={(event) => {
              event.preventDefault()
              event.stopPropagation()
              onClear()
            }}
          >
            <X className="size-3" />
          </button>
        ) : null}
      </div>

      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuLabel>{label}</DropdownMenuLabel>
        <DropdownMenuCheckboxItem
          checked={allSelected}
          onSelect={(event) => event.preventDefault()}
          onCheckedChange={onToggleAll}
        >
          {allLabel}
        </DropdownMenuCheckboxItem>
        <DropdownMenuSeparator />
        {options.map((option) => (
          <DropdownMenuCheckboxItem
            key={option.value}
            checked={selectedValues.has(option.value)}
            onSelect={(event) => event.preventDefault()}
            onCheckedChange={() => onToggle(option.value)}
          >
            {option.label}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
