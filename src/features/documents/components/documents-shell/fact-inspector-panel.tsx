import { CollapsibleSidePanel } from "@/components/shared/collapsible-side-panel"

import { FactInspector } from "../fact-inspector/fact-inspector"

interface FactInspectorPanelProps {
  isCollapsed: boolean
  onCollapse: () => void
  onExpand: () => void
}

export function FactInspectorPanel({
  isCollapsed,
  onCollapse,
  onExpand,
}: FactInspectorPanelProps) {
  return (
    <CollapsibleSidePanel
      side="right"
      title="Inspector"
      widthClassName="w-110"
      isCollapsed={isCollapsed}
      expandTitle="Show inspector"
      collapseTitle="Hide inspector"
      onExpand={onExpand}
      onCollapse={onCollapse}
    >
      <FactInspector />
    </CollapsibleSidePanel>
  )
}
