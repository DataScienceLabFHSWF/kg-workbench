"use client"

import { useEffect, useRef } from "react"

interface UseReaderScrollSyncOptions {
  sections: { id: string }[]
  onActiveSectionChange: (sectionId: string | null) => void
  enabled?: boolean
}

interface UseReaderScrollSyncResult {
  sectionRefs: React.MutableRefObject<Map<string, HTMLElement>>
  suppressIntersectionRef: React.MutableRefObject<boolean>
}

export function useReaderScrollSync({
  sections,
  onActiveSectionChange,
  enabled = true,
}: UseReaderScrollSyncOptions): UseReaderScrollSyncResult {
  const sectionRefs = useRef<Map<string, HTMLElement>>(new Map())
  const suppressIntersectionRef = useRef(false)
  // Keep a stable ref to the callback to avoid re-running the effect on every render
  const onActiveSectionChangeRef = useRef(onActiveSectionChange)
  useEffect(() => {
    onActiveSectionChangeRef.current = onActiveSectionChange
  })

  useEffect(() => {
    if (!enabled || sections.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (suppressIntersectionRef.current) return

        // Find the topmost intersecting section header
        let topEntry: IntersectionObserverEntry | null = null
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          if (
            topEntry === null ||
            entry.boundingClientRect.top < topEntry.boundingClientRect.top
          ) {
            topEntry = entry
          }
        }

        if (topEntry) {
          const sectionId = (topEntry.target as HTMLElement).dataset.sectionId
          if (sectionId) onActiveSectionChangeRef.current(sectionId)
        }
      },
      {
        root: null,
        // Trigger when the header enters the top 20% of the viewport
        rootMargin: "0px 0px -80% 0px",
        threshold: 0,
      }
    )

    const currentRefs = sectionRefs.current
    currentRefs.forEach((el) => observer.observe(el))

    return () => {
      observer.disconnect()
    }
  }, [sections, enabled])

  return { sectionRefs, suppressIntersectionRef }
}
