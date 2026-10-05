import { Button } from "@/components/ui/button"
import type { OntologyClassWithAttributes } from "@/features/ontology/server/queries"

interface DroppedParentLinkCardProps {
  child: OntologyClassWithAttributes
  parent: OntologyClassWithAttributes
  onRestoreParent: (childId: string) => void
}

export function DroppedParentLinkCard({
  child,
  parent,
  onRestoreParent,
}: DroppedParentLinkCardProps) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-md border px-3 py-2">
      <div className="min-w-0">
        <p className="truncate font-medium">{child.name}</p>
        <p className="truncate text-muted-foreground">
          Parent {parent.name} will be removed from the export.
        </p>
      </div>
      <Button
        type="button"
        size="sm"
        variant="outline"
        className="shrink-0"
        onClick={() => onRestoreParent(child.id)}
      >
        Restore
      </Button>
    </div>
  )
}
