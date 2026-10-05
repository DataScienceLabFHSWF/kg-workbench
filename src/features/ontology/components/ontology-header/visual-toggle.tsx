import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

interface VisualToggleProps {
  isVisual: boolean
  disabled?: boolean
  onVisualToggle: (checked: boolean) => void
}

export function VisualToggle({
  isVisual,
  disabled = false,
  onVisualToggle,
}: VisualToggleProps) {
  return (
    <div className="ml-auto flex items-center gap-2">
      <Switch
        id="visual-toggle"
        checked={isVisual}
        disabled={disabled}
        onCheckedChange={onVisualToggle}
      />
      <Label
        htmlFor="visual-toggle"
        className="cursor-pointer text-xs data-[disabled=true]:cursor-not-allowed data-[disabled=true]:opacity-50"
        data-disabled={disabled}
      >
        Visual
      </Label>
    </div>
  )
}
