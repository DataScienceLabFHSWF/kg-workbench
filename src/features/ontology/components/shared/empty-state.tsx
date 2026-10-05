import { FileQuestion } from "lucide-react"

interface EmptyStateProps {
  title: string
  description: string
}

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-2 text-muted-foreground">
      <FileQuestion className="h-10 w-10" />
      <p className="font-heading text-sm font-medium">{title}</p>
      <p className="text-xs">{description}</p>
    </div>
  )
}
