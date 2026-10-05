"use client"

import { CheckCheck, Loader2, RotateCcw, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import type { EffectiveStatus, FactReviewStatus } from "@/lib/types"

interface FactActionsProps {
  status: EffectiveStatus
  structurallyUnmapped: boolean
  canAccept: boolean
  isPending: boolean
  onReview: (status: FactReviewStatus) => void
}

export function FactActions({
  status,
  structurallyUnmapped,
  canAccept,
  isPending,
  onReview,
}: FactActionsProps) {
  // Unmapped + rejected: locked — no actions until mappings are filled
  if (status === "rejected" && structurallyUnmapped) return null

  // Unmapped (not rejected): only allow rejecting
  if (status === "unmapped") {
    return (
      <div className="flex gap-1.5 pt-0.5">
        <Button
          size="sm"
          variant="outline"
          className="h-6 flex-1 text-xs"
          onClick={() => onReview("rejected")}
          disabled={isPending}
        >
          {isPending ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <X className="h-3 w-3" />
          )}
          Reject
        </Button>
      </div>
    )
  }

  return (
    <div className="flex gap-1.5 pt-0.5">
      {(status === "accepted" || status === "rejected") && (
        <Button
          size="sm"
          variant="ghost"
          className="h-6 w-6 shrink-0 p-0"
          title="Reset to pending"
          onClick={() => onReview("pending")}
          disabled={isPending}
        >
          {isPending ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <RotateCcw className="h-3 w-3" />
          )}
        </Button>
      )}
      {(status === "pending" || status === "rejected") && (
        <Button
          size="sm"
          variant="outline"
          className="h-6 flex-1 text-xs"
          onClick={() => onReview("accepted")}
          disabled={isPending || !canAccept}
        >
          {isPending ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <CheckCheck className="h-3 w-3" />
          )}
          Accept
        </Button>
      )}
      {(status === "pending" || status === "accepted") && (
        <Button
          size="sm"
          variant="outline"
          className="h-6 flex-1 text-xs"
          onClick={() => onReview("rejected")}
          disabled={isPending}
        >
          {isPending ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <X className="h-3 w-3" />
          )}
          Reject
        </Button>
      )}
    </div>
  )
}
