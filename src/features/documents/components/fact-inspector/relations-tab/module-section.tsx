"use client"

import type { ReactNode } from "react"

import { ModuleSectionHeader } from "../shared/module-section-header"

interface ModuleSectionProps {
  moduleId: string
  moduleName: string
  totalCount: number
  isCollapsed: boolean
  isMutedTitle?: boolean
  onModuleClick?: (moduleId: string, moduleName: string) => void
  onToggle: (moduleId: string) => void
  children: ReactNode
}

export function ModuleSection({
  moduleId,
  moduleName,
  totalCount,
  isCollapsed,
  isMutedTitle = false,
  onModuleClick,
  onToggle,
  children,
}: ModuleSectionProps) {
  return (
    <div>
      <ModuleSectionHeader
        moduleId={moduleId}
        moduleName={moduleName}
        totalCount={totalCount}
        isCollapsed={isCollapsed}
        isMutedTitle={isMutedTitle}
        onToggle={onToggle}
        onModuleClick={onModuleClick}
      />

      {!isCollapsed && <div className="mb-1">{children}</div>}
    </div>
  )
}
