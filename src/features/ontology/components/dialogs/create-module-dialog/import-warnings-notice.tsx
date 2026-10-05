interface ImportWarningsNoticeProps {
  warningCount: number
}

export function ImportWarningsNotice({
  warningCount,
}: ImportWarningsNoticeProps) {
  if (warningCount === 0) return null

  return (
    <div className="space-y-2 rounded-md border border-amber-300/60 bg-amber-50/50 p-3">
      <p className="text-xs font-medium text-amber-900">
        This import needs confirmation.
      </p>
      <p className="text-xs text-amber-900/80">
        {warningCount} warning{warningCount === 1 ? "" : "s"} detected. You can
        still continue after review.
      </p>
    </div>
  )
}
