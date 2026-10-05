import { Button } from "@/components/ui/button"
import type { OntologyClassWithAttributes } from "@/features/ontology/server/queries"

interface ExtraIncludedClassCardProps {
  cls: OntologyClassWithAttributes
  onRemoveExtraClass: (classId: string) => void
}

export function ExtraIncludedClassCard({
  cls,
  onRemoveExtraClass,
}: ExtraIncludedClassCardProps) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-md border px-3 py-2">
      <div className="min-w-0">
        <p className="truncate font-medium">{cls.name}</p>
      </div>
      <Button
        type="button"
        size="sm"
        variant="outline"
        className="shrink-0"
        onClick={() => onRemoveExtraClass(cls.id)}
      >
        Remove
      </Button>
    </div>
  )
}
