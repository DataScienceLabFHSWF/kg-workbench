"use client"

interface DocumentBrowserEmptyStateProps {
  hasFilters: boolean
}

export function DocumentBrowserEmptyState({
  hasFilters,
}: DocumentBrowserEmptyStateProps) {
  return (
    <p className="px-4 py-6 text-center text-xs text-muted-foreground">
      {hasFilters ? "No matching documents." : "No documents yet."}
    </p>
  )
}
