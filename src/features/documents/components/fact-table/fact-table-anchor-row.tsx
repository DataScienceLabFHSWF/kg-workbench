"use client"

import { useEffect, useRef, useState } from "react"

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

interface FactTableAnchorRowProps {
  quoteText: string
  rowClassName: string
}

export function FactTableAnchorRow({
  quoteText,
  rowClassName,
}: FactTableAnchorRowProps) {
  const textRef = useRef<HTMLSpanElement | null>(null)
  const [isTruncated, setIsTruncated] = useState(false)

  useEffect(() => {
    const element = textRef.current
    if (!element) return

    const updateTruncation = () => {
      setIsTruncated(element.scrollWidth > element.clientWidth)
    }

    updateTruncation()

    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", updateTruncation)
      return () => window.removeEventListener("resize", updateTruncation)
    }

    const observer = new ResizeObserver(updateTruncation)
    observer.observe(element)

    return () => observer.disconnect()
  }, [quoteText])

  const quote = (
    <span
      ref={textRef}
      className="block truncate text-[10px] text-muted-foreground italic"
    >
      &ldquo;{quoteText}&rdquo;
    </span>
  )

  return (
    <tr className={cn(rowClassName, "border-b")}>
      <td className="w-8 px-2 py-0" />
      <td colSpan={5} className="max-w-0 px-2 pt-0 pb-1.5 align-top">
        <div className="w-full overflow-hidden">
          {isTruncated ? (
            <Tooltip>
              <TooltipTrigger asChild>{quote}</TooltipTrigger>
              <TooltipContent side="top" className="max-w-72 text-xs italic">
                &ldquo;{quoteText}&rdquo;
              </TooltipContent>
            </Tooltip>
          ) : (
            quote
          )}
        </div>
      </td>
    </tr>
  )
}
