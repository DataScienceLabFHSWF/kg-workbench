"use client"

interface DocumentReaderNoSectionsStateProps {
  isFiltered?: boolean
}

export function DocumentReaderNoSectionsState({
  isFiltered = false,
}: DocumentReaderNoSectionsStateProps) {
  return (
    <p className="px-6 py-8 text-center text-xs text-muted-foreground">
      {isFiltered
        ? "No sections match the current filters."
        : "No sections available."}
    </p>
  )
}
