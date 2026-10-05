import { Badge } from "@/components/ui/badge"
import { getDocumentStatusBadgeClass } from "@/lib/colors"
import { DOCUMENT_STATUS_LABELS, type DocumentStatus } from "@/lib/types"
import { cn } from "@/lib/utils"

interface DocStatusBadgeProps {
  status: DocumentStatus
  className?: string
}

export function DocStatusBadge({ status, className }: DocStatusBadgeProps) {
  const badgeClass = getDocumentStatusBadgeClass(status)

  if (badgeClass) {
    return (
      <Badge className={cn(badgeClass, className)}>
        {DOCUMENT_STATUS_LABELS[status]}
      </Badge>
    )
  }

  if (status === "processing") {
    return (
      <Badge variant="outline" className={className}>
        {DOCUMENT_STATUS_LABELS[status]}...
      </Badge>
    )
  }

  return (
    <Badge variant="outline" className={className}>
      {DOCUMENT_STATUS_LABELS[status]}
    </Badge>
  )
}
