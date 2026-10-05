"use client"

import { cn } from "@/lib/utils"

import type { DocumentReaderSection } from "./types"
import { DocumentReaderParagraphRow } from "./paragraph-row"

interface DocumentReaderSectionBlockProps {
  section: DocumentReaderSection
  isFirst: boolean
  anchorFilter: string | null
  jumpToParagraphId: string | null
  paragraphFactCounts: Map<string, number>
  onAnchorClick: (paragraphId: string | null) => void
  sectionRef: (element: HTMLDivElement | null) => void
  paragraphRef: (
    paragraphId: string,
    element: HTMLParagraphElement | null
  ) => void
}

export function DocumentReaderSectionBlock({
  section,
  isFirst,
  anchorFilter,
  jumpToParagraphId,
  paragraphFactCounts,
  onAnchorClick,
  sectionRef,
  paragraphRef,
}: DocumentReaderSectionBlockProps) {
  return (
    <div>
      <div
        ref={sectionRef}
        data-section-id={section.id}
        className={cn(
          "mb-3 flex items-center gap-3",
          !isFirst && "border-t pt-4"
        )}
      >
        <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          {section.title}
        </h3>
        <div className="flex-1 border-t" />
      </div>

      <div className="space-y-1.5">
        {section.paragraphs.map((paragraph) => {
          const factCount = paragraphFactCounts.get(paragraph.id) ?? 0
          const isActive =
            anchorFilter === paragraph.id || jumpToParagraphId === paragraph.id

          return (
            <DocumentReaderParagraphRow
              key={paragraph.id}
              paragraphId={paragraph.id}
              content={paragraph.content}
              factCount={factCount}
              isActive={isActive}
              onAnchorClick={onAnchorClick}
              paragraphRef={(element) => paragraphRef(paragraph.id, element)}
            />
          )
        })}
      </div>
    </div>
  )
}
