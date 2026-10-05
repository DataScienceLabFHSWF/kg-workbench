"use client"

import {
  type ReactNode,
  type RefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ScrollState {
  canScrollLeft: boolean
  canScrollRight: boolean
  hasOverflow: boolean
}

interface ScrollableTabStripProps {
  activeKey: string
  children: (
    activeItemRef: RefObject<HTMLButtonElement | null>,
    hasOverflow: boolean
  ) => ReactNode
  itemCount: number
  endAction?: ReactNode
}

const SCROLL_EPSILON = 1

export function ScrollableTabStrip({
  activeKey,
  children,
  itemCount,
  endAction,
}: ScrollableTabStripProps) {
  const viewportRef = useRef<HTMLDivElement>(null)
  const activeItemRef = useRef<HTMLButtonElement | null>(null)
  const [scrollState, setScrollState] = useState<ScrollState>({
    canScrollLeft: false,
    canScrollRight: false,
    hasOverflow: false,
  })

  const updateScrollState = useCallback(() => {
    const viewport = viewportRef.current
    if (!viewport) return

    const maxScrollLeft = Math.max(
      0,
      viewport.scrollWidth - viewport.clientWidth
    )
    const nextState = {
      canScrollLeft: viewport.scrollLeft > SCROLL_EPSILON,
      canScrollRight: viewport.scrollLeft < maxScrollLeft - SCROLL_EPSILON,
      hasOverflow: maxScrollLeft > SCROLL_EPSILON,
    }

    setScrollState((currentState) =>
      currentState.canScrollLeft === nextState.canScrollLeft &&
      currentState.canScrollRight === nextState.canScrollRight &&
      currentState.hasOverflow === nextState.hasOverflow
        ? currentState
        : nextState
    )
  }, [])

  const scrollByDirection = useCallback((direction: -1 | 1) => {
    const viewport = viewportRef.current
    if (!viewport) return

    viewport.scrollBy({
      behavior: "smooth",
      left: direction * Math.max(viewport.clientWidth * 0.7, 160),
    })
  }, [])

  useEffect(() => {
    const viewport = viewportRef.current
    if (!viewport) return

    updateScrollState()

    viewport.addEventListener("scroll", updateScrollState, { passive: true })
    window.addEventListener("resize", updateScrollState)

    const resizeObserver =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(updateScrollState)
    resizeObserver?.observe(viewport)
    if (viewport.firstElementChild) {
      resizeObserver?.observe(viewport.firstElementChild)
    }

    return () => {
      viewport.removeEventListener("scroll", updateScrollState)
      window.removeEventListener("resize", updateScrollState)
      resizeObserver?.disconnect()
    }
  }, [itemCount, updateScrollState])

  useEffect(() => {
    activeItemRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "nearest",
    })

    const frameId = window.requestAnimationFrame(updateScrollState)
    return () => window.cancelAnimationFrame(frameId)
  }, [activeKey, itemCount, updateScrollState])

  return (
    <div className="grid min-w-0 grid-cols-[auto_minmax(0,1fr)_auto_auto] items-center">
      {scrollState.hasOverflow ? (
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          className="mr-1"
          aria-label="Scroll modules left"
          disabled={!scrollState.canScrollLeft}
          onClick={() => scrollByDirection(-1)}
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </Button>
      ) : (
        <div className="w-0" />
      )}
      <div className="relative min-w-0 overflow-hidden">
        <div
          ref={viewportRef}
          className="w-full max-w-full overflow-x-auto overflow-y-hidden overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          onWheel={(event) => {
            if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) {
              updateScrollState()
            }
          }}
        >
          {children(activeItemRef, scrollState.hasOverflow)}
        </div>
        <div
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute inset-y-0 left-0 w-6 bg-gradient-to-r from-background to-transparent transition-opacity",
            scrollState.canScrollLeft ? "opacity-100" : "opacity-0"
          )}
        />
        <div
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute inset-y-0 right-0 w-6 bg-gradient-to-l from-background to-transparent transition-opacity",
            scrollState.canScrollRight ? "opacity-100" : "opacity-0"
          )}
        />
      </div>
      {scrollState.hasOverflow ? (
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          className="ml-1"
          aria-label="Scroll modules right"
          disabled={!scrollState.canScrollRight}
          onClick={() => scrollByDirection(1)}
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </Button>
      ) : (
        <div className="w-0" />
      )}
      {scrollState.hasOverflow && endAction ? (
        <div className="ml-1 shrink-0">{endAction}</div>
      ) : null}
    </div>
  )
}
