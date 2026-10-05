"use client"

import { List, StickyNote } from "lucide-react"
import { Handle, Node, Position, type NodeProps } from "@xyflow/react"

import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { APP_COLOR_CLASSES } from "@/lib/colors"
import { truncateWithEllipsis } from "@/lib/truncate-with-ellipsis"
import { cn } from "@/lib/utils"

import { getClassExamplePreview } from "./example-preview"
import type { ClassNodeData } from "./use-ontology-flow"
import { NODE_HEIGHT, NODE_WIDTH } from "./use-ontology-flow"

type ClassNodeType = Node<ClassNodeData, "classNode">

const H = `!h-1.5 !w-1.5 !border-0 ${APP_COLOR_CLASSES.handleNeutral}`
const EXAMPLE_PREVIEW_MAX_LENGTH = 36
const COUNTER_BADGE_CLASSNAME =
  "rounded-full border bg-background px-1.5 py-0.5 text-[10px] font-medium leading-none text-muted-foreground"

export function ClassNode({ data, selected }: NodeProps<ClassNodeType>) {
  const examplePreview = getClassExamplePreview(data.examples)
  const hasExamples = data.examples.length > 0
  const showExampleButton = hasExamples

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
          "relative flex flex-col justify-center rounded-md border bg-background px-3 py-2 shadow-sm transition-all",
          data.external && "opacity-50",
          selected && "ring-2 ring-offset-1"
        )}
        style={{
          width: NODE_WIDTH,
          height: NODE_HEIGHT,
          borderColor: selected ? data.moduleColor : undefined,
          outline: selected ? `2px solid ${data.classColor}` : undefined,
          outlineOffset: selected ? "2px" : undefined,
        }}
      >
        <div className="flex items-start gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <span
              className="mt-0.5 h-2 w-2 shrink-0 rounded-full"
              style={{ backgroundColor: data.classColor }}
            />
            <span className="truncate text-sm font-medium">{data.label}</span>
          </div>
          {data.noteCount > 0 && (
            <span className={cn(COUNTER_BADGE_CLASSNAME, "ml-auto shrink-0")}>
              {data.noteCount}
              <StickyNote className="ml-1 inline h-3 w-3 align-[-1px]" />
            </span>
          )}
        </div>

        <div className="mt-1 flex flex-col gap-1 pl-4">
          {hasExamples && (
            <div className="flex min-w-0 items-center gap-1 pr-1 text-xs text-muted-foreground">
              <span className="truncate">
                {truncateWithEllipsis(
                  examplePreview,
                  EXAMPLE_PREVIEW_MAX_LENGTH
                )}
              </span>
              {showExampleButton && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      className="nodrag nopan h-5 w-5 shrink-0 p-0"
                      aria-label={`Show all examples for ${data.label}`}
                    >
                      <List className="h-3 w-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top" align="start" className="max-w-80">
                    <div className="space-y-1">
                      <p className="font-medium">
                        Examples ({data.examples.length})
                      </p>
                      <ul className="space-y-1">
                        {data.examples.map((example, index) => (
                          <li
                            key={`${data.label}-example-${index}`}
                            className="text-xs/relaxed break-words"
                          >
                            {example}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
          )}
        </div>
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
