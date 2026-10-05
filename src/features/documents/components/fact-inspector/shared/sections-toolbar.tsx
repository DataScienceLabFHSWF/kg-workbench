"use client"

import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"
import { ExpandCollapseAll } from "./expand-collapse-all"
import { TabToolbar } from "./tab-toolbar"

interface ScopeSwitchProps {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  ariaLabel: string
  rightLabel: string
}

interface SectionsToolbarProps {
  disabled?: boolean
  onExpandAll: () => void
  onCollapseAll: () => void
  scopeSwitch?: ScopeSwitchProps
}

export function SectionsToolbar({
  disabled = false,
  onExpandAll,
  onCollapseAll,
  scopeSwitch,
}: SectionsToolbarProps) {
  return (
    <TabToolbar>
      <div className="flex items-center justify-between gap-3">
        {scopeSwitch ? (
          <div className="flex items-center gap-2">
            <Switch
              checked={scopeSwitch.checked}
              onCheckedChange={scopeSwitch.onCheckedChange}
              aria-label={scopeSwitch.ariaLabel}
              size="sm"
            />
            <span
              className={cn(
                "text-[10px] font-semibold tracking-wide uppercase transition-colors",
                scopeSwitch.checked
                  ? "text-foreground"
                  : "text-muted-foreground"
              )}
            >
              {scopeSwitch.rightLabel}
            </span>
          </div>
        ) : (
          <div />
        )}

        <div className="ml-auto flex items-center gap-2">
          <span className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
            Sections
          </span>
          <ExpandCollapseAll
            disabled={disabled}
            onExpandAll={onExpandAll}
            onCollapseAll={onCollapseAll}
          />
        </div>
      </div>
    </TabToolbar>
  )
}
