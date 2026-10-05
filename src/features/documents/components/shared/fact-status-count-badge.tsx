import { Badge } from "@/components/ui/badge"
import { getReviewStatusStyles } from "@/lib/colors"
import type { EffectiveStatus } from "@/lib/types"
import { cn } from "@/lib/utils"

interface FactStatusCountBadgeProps {
  status: EffectiveStatus
  count: number
  className?: string
}

export function FactStatusCountBadge({
  status,
  count,
  className,
}: FactStatusCountBadgeProps) {
  if (count === 0) return null

  return (
    <Badge
      className={cn(
        "rounded-full text-[10px]",
        getReviewStatusStyles(status).badgeClass,
        className
      )}
    >
      {count} {status}
    </Badge>
  )
}
