"use client"

interface DocumentReaderEmptyStateProps {
  title: string
  description: string
  className?: string
  titleClassName?: string
  descriptionClassName?: string
}

export function DocumentReaderEmptyState({
  title,
  description,
  className = "flex h-full flex-col items-center justify-center gap-2 text-muted-foreground",
  titleClassName = "text-sm font-medium",
  descriptionClassName = "text-xs",
}: DocumentReaderEmptyStateProps) {
  return (
    <div className={className}>
      <p className={titleClassName}>{title}</p>
      {description ? (
        <p className={descriptionClassName}>{description}</p>
      ) : null}
    </div>
  )
}
