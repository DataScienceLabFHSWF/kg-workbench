"use client"

import { useState } from "react"

import { Panel } from "@xyflow/react"
import { ChevronDown, ChevronRight } from "lucide-react"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { getReviewStatusStrokeColor } from "@/lib/colors"
import { EFFECTIVE_STATUSES, EFFECTIVE_STATUS_LABELS } from "@/lib/types"

import type { ClassColorEntry } from "./use-fact-graph"

interface ClassLegendProps {
  classColorEntries: ClassColorEntry[]
}

export function ClassLegend({ classColorEntries }: ClassLegendProps) {
  const [open, setOpen] = useState(false)

  return (
    <Panel position="top-left">
      <Collapsible open={open} onOpenChange={setOpen}>
        <div className="w-[190px] overflow-hidden rounded-md border bg-background/95 text-xs shadow-sm backdrop-blur">
          <CollapsibleTrigger className="flex w-full items-center justify-between gap-2 px-2.5 py-2 text-left hover:bg-muted/50">
            <div className="min-w-0">
              <p className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
                Legend
              </p>
              <p className="truncate text-[11px] text-muted-foreground">
                {classColorEntries.length} classes, {EFFECTIVE_STATUSES.length}{" "}
                statuses
              </p>
            </div>
            {open ? (
              <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            )}
          </CollapsibleTrigger>

          <CollapsibleContent>
            <div className="max-h-[40vh] overflow-y-auto border-t">
              <div className="space-y-3 p-2.5">
                {classColorEntries.length > 0 && (
                  <div>
                    <p className="mb-1 text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
                      Classes
                    </p>
                    <div className="space-y-1">
                      {classColorEntries.map(
                        ({ classId, className, color }) => (
                          <div
                            key={classId}
                            className="flex items-center gap-1.5"
                          >
                            <span
                              className="h-2 w-2 shrink-0 rounded-full"
                              style={{ backgroundColor: color }}
                            />
                            <span className="truncate text-muted-foreground">
                              {className}
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}

                <div>
                  <p className="mb-1 text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
                    Status
                  </p>
                  <div className="space-y-1">
                    {EFFECTIVE_STATUSES.map((status) => (
                      <div key={status} className="flex items-center gap-1.5">
                        <span
                          className="h-2 w-2 shrink-0 rounded-full border"
                          style={{
                            backgroundColor: getReviewStatusStrokeColor(status),
                            borderColor: getReviewStatusStrokeColor(status),
                          }}
                        />
                        <span className="text-muted-foreground">
                          {EFFECTIVE_STATUS_LABELS[status]}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>
    </Panel>
  )
}
