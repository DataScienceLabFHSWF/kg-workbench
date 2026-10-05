import { Badge } from "@/components/ui/badge"
import { getReviewStatusStyles } from "@/lib/colors"
import { EFFECTIVE_STATUS_LABELS, type EffectiveStatus } from "@/lib/types"
import { cn } from "@/lib/utils"

interface FactStatusBadgeProps {
  status: EffectiveStatus
  className?: string
}

export function FactStatusBadge({ status, className }: FactStatusBadgeProps) {
  const { badgeClass } = getReviewStatusStyles(status)

  return (
    <Badge className={cn(badgeClass, className)}>
      {EFFECTIVE_STATUS_LABELS[status]}
    </Badge>
  )
}
