import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { OntologyDocument } from "@/domain/ontology"

interface DocumentSelectorProps {
  documents: OntologyDocument[]
  currentDocumentId: string | null
  disabled?: boolean
  placeholder?: string
  onDocumentChange: (docId: string) => void
}

export function DocumentSelector({
  documents,
  currentDocumentId,
  disabled = false,
  placeholder = "Select ontology",
  onDocumentChange,
}: DocumentSelectorProps) {
  return (
    <Select
      value={currentDocumentId ?? undefined}
      disabled={disabled}
      onValueChange={onDocumentChange}
    >
      <SelectTrigger className="w-[220px]">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {documents.map((document) => (
          <SelectItem key={document.id} value={document.id}>
            {document.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
