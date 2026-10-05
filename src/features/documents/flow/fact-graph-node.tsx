"use client"

import type { MouseEvent } from "react"

import { Handle, Position, type NodeProps } from "@xyflow/react"

import { FilterIconButton } from "@/components/shared/filter-icon-button"
import { APP_COLOR_CLASSES, getReviewStatusStyles } from "@/lib/colors"
import { NODE_HEIGHT, NODE_WIDTH } from "@/lib/flow-layout"
import { cn } from "@/lib/utils"

import type { FactGraphNode as FactGraphNodeType } from "./use-fact-graph"

const H = `!h-1.5 !w-1.5 !border-0 ${APP_COLOR_CLASSES.handleNeutral}`

export function FactGraphNode({
  data,
  selected,
}: NodeProps<FactGraphNodeType>) {
  const { entityText, className, classColor, effectiveStatus, onFilter } = data

  const isUnmapped = !data.classId
  const isRejected = effectiveStatus === "rejected"
  const unmappedStyles = getReviewStatusStyles("unmapped")
  const acceptedStyles = getReviewStatusStyles("accepted")

  function handleFilterClick(event: MouseEvent<HTMLButtonElement>) {
    event.stopPropagation()
    onFilter?.()
  }

  return (
    <>
      <Handle
        type="target"
        position={Position.Left}
        id="t-left"
        className={H}
      />
      <Handle
        type="target"
        position={Position.Right}
        id="t-right"
        className={H}
      />
      <Handle type="target" position={Position.Top} id="t-top" className={H} />
      <Handle
        type="target"
        position={Position.Bottom}
        id="t-bottom"
        className={H}
      />

      <div
        className={cn(
          "relative flex flex-col justify-center rounded-md border bg-background px-3 py-2 pr-8 shadow-sm transition-all",
          isUnmapped && unmappedStyles.surfaceClass,
          effectiveStatus === "accepted" &&
            !isUnmapped &&
            acceptedStyles.borderClass,
          effectiveStatus === "rejected" && "opacity-50",
          selected && "ring-2 ring-offset-1"
        )}
        style={{
          width: NODE_WIDTH,
          height: NODE_HEIGHT,
          outline: selected ? `2px solid ${classColor}` : undefined,
          outlineOffset: selected ? "2px" : undefined,
        }}
      >
        {onFilter && (
          <FilterIconButton
            onClick={handleFilterClick}
            label={`Filter by ${entityText}`}
            className="nodrag nopan absolute top-2 right-2 rounded p-1 hover:bg-accent"
          />
        )}
        <div className="flex items-center gap-2">
          <span
            className="mt-0.5 h-2 w-2 shrink-0 rounded-full"
            style={{ backgroundColor: classColor }}
          />
          <span
            className={cn(
              "truncate text-sm font-medium",
              isRejected && "text-muted-foreground line-through"
            )}
          >
            {entityText}
          </span>
        </div>
        {className && (
          <span className="mt-0.5 truncate pl-4 text-xs text-muted-foreground">
            {className}
          </span>
        )}
        {isUnmapped && !className && (
          <span className={cn("mt-0.5 pl-4 text-xs", unmappedStyles.textClass)}>
            unmapped
          </span>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Left}
        id="s-left"
        className={H}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="s-right"
        className={H}
      />
      <Handle type="source" position={Position.Top} id="s-top" className={H} />
      <Handle
        type="source"
        position={Position.Bottom}
        id="s-bottom"
        className={H}
      />
    </>
  )
}
