"use client"

import { APP_COLOR_CLASSES } from "@/lib/colors"
import { cn } from "@/lib/utils"

interface DocumentReaderParagraphRowProps {
  paragraphId: string
  content: string
  factCount: number
  isActive: boolean
  onAnchorClick: (paragraphId: string | null) => void
  paragraphRef: (element: HTMLParagraphElement | null) => void
}

export function DocumentReaderParagraphRow({
  paragraphId,
  content,
  factCount,
  isActive,
  onAnchorClick,
  paragraphRef,
}: DocumentReaderParagraphRowProps) {
  return (
    <div className="relative pr-8">
      <p
        ref={paragraphRef}
        className={cn(
          "rounded px-2 py-1 text-sm leading-relaxed transition-colors",
          isActive && `border-l-2 ${APP_COLOR_CLASSES.selectionSurface}`
        )}
      >
        {content}
      </p>
      {factCount > 0 && (
        <button
          onClick={() => onAnchorClick(paragraphId)}
          title={`${factCount} fact${factCount > 1 ? "s" : ""} linked`}
          className={cn(
            "absolute top-1 right-0 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-semibold transition-colors",
            isActive
              ? APP_COLOR_CLASSES.selectionSolid
              : APP_COLOR_CLASSES.selectionSoft
          )}
        >
          {factCount}
        </button>
      )}
    </div>
  )
}
