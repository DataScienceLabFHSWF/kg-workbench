"use client"

import { useEffect, useRef, useState } from "react"

import { cn } from "@/lib/utils"

interface TruncatedLabelProps {
  text: string
  className?: string
}

export function TruncatedLabel({ text, className }: TruncatedLabelProps) {
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
  }, [text])

  return (
    <span
      ref={textRef}
      title={isTruncated ? text : undefined}
      className={cn("block min-w-0 flex-1 truncate", className)}
    >
      {text}
    </span>
  )
}
