"use client"

import type { ReactNode } from "react"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export type EntityType = "classes" | "relations"

interface EntityTypeTabsProps {
  activeType: EntityType
  onTypeChange: (type: EntityType) => void
  classCount: number
  relationCount: number
  classBrowser: ReactNode
  relationBrowser: ReactNode
}

export function EntityTypeTabs({
  activeType,
  onTypeChange,
  classCount,
  relationCount,
  classBrowser,
  relationBrowser,
}: EntityTypeTabsProps) {
  return (
    <Tabs
      value={activeType}
      onValueChange={(v) => onTypeChange(v as EntityType)}
      className="flex min-h-0 flex-1 flex-col"
    >
      <div className="px-3 pt-2">
        <TabsList className="w-full">
          <TabsTrigger value="classes" className="flex-1">
            Classes ({classCount})
          </TabsTrigger>
          <TabsTrigger value="relations" className="flex-1">
            Relations ({relationCount})
          </TabsTrigger>
        </TabsList>
      </div>
      <TabsContent
        value="classes"
        className="mt-0 flex min-h-0 flex-1 flex-col overflow-hidden"
      >
        {classBrowser}
      </TabsContent>
      <TabsContent
        value="relations"
        className="mt-0 flex min-h-0 flex-1 flex-col overflow-hidden"
      >
        {relationBrowser}
      </TabsContent>
    </Tabs>
  )
}
