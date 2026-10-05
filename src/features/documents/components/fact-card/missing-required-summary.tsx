interface MissingRequiredSummaryProps {
  missingRequiredCount: number
}

export function MissingRequiredSummary({
  missingRequiredCount,
}: MissingRequiredSummaryProps) {
  if (missingRequiredCount === 0) {
    return null
  }

  return (
    <div>
      <span className="text-[11px] font-medium text-amber-800">
        Missing {missingRequiredCount} required field
        {missingRequiredCount === 1 ? "" : "s"}
      </span>
    </div>
  )
}
