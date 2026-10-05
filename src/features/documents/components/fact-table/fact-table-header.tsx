"use client"

import { ChevronDown, ChevronUp } from "lucide-react"

import { cn } from "@/lib/utils"
import type { FactTableSortDir, FactTableSortField } from "./types"

interface FactTableHeaderProps {
  sortField: FactTableSortField
  sortDir: FactTableSortDir
  onSort: (field: FactTableSortField) => void
}

const COLUMNS: {
  field: FactTableSortField
  label: string
  className: string
}[] = [
  {
    field: "subject",
    label: "Subject",
    className: "w-[26%] px-2 py-1.5 text-left",
  },
  {
    field: "relation",
    label: "Relation",
    className: "w-[24%] px-2 py-1.5 text-left",
  },
  {
    field: "object",
    label: "Object",
    className: "w-[26%] px-2 py-1.5 text-left",
  },
  {
    field: "confidence",
    label: "Conf.",
    className: "w-16 px-2 py-1.5 text-right",
  },
]

export function FactTableHeader({
  sortField,
  sortDir,
  onSort,
}: FactTableHeaderProps) {
  return (
    <thead>
      <tr className="sticky top-0 z-30 h-7 border-b bg-background text-[9px] font-semibold tracking-wider text-muted-foreground uppercase">
        <th className="w-8 shrink-0 px-2 py-1.5 text-left" />
        {COLUMNS.map(({ field, label, className }) => (
          <th
            key={field}
            className={cn(
              className,
              "cursor-pointer transition-colors select-none hover:text-foreground",
              sortField === field && "text-foreground"
            )}
            onClick={() => onSort(field)}
          >
            <span
              className={cn(
                "inline-flex items-center gap-0.5",
                field === "confidence" && "justify-end"
              )}
            >
              {label}
              {sortField === field ? (
                sortDir === "asc" ? (
                  <ChevronUp className="h-2.5 w-2.5" />
                ) : (
                  <ChevronDown className="h-2.5 w-2.5" />
                )
              ) : (
                <ChevronDown className="h-2.5 w-2.5 opacity-30" />
              )}
            </span>
          </th>
        ))}
        <th className="w-20 shrink-0 px-2 py-1.5 text-left" />
      </tr>
    </thead>
  )
}
