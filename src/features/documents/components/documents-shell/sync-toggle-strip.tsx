import { Link2, Link2Off } from "lucide-react"

import { Button } from "@/components/ui/button"

interface SyncToggleStripProps {
  isGraphMode: boolean
  syncEnabled: boolean
  onToggle: () => void
}

export function SyncToggleStrip({
  isGraphMode,
  syncEnabled,
  onToggle,
}: SyncToggleStripProps) {
  if (isGraphMode) return null

  return (
    <div className="relative flex w-5 shrink-0 flex-col items-center border-r border-l bg-muted/20">
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-1/2 h-6 w-6 -translate-y-1/2 rounded-full"
        title={syncEnabled ? "Disable scroll sync" : "Enable scroll sync"}
        onClick={onToggle}
      >
        {syncEnabled ? (
          <Link2 className="h-3 w-3" />
        ) : (
          <Link2Off className="h-3 w-3 text-muted-foreground" />
        )}
      </Button>
    </div>
  )
}
