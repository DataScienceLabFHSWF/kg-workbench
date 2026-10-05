import type { OntologyLanguage, OntologyModule } from "@/domain/ontology"
import type { OntologyClassWithAttributes } from "@/features/ontology/server/queries"

export interface CreateRelationDialogProps {
  ontologyId: string
  allClasses: OntologyClassWithAttributes[]
  modules: OntologyModule[]
  languages: OntologyLanguage[]
  defaultLanguage?: string | null
  currentModuleId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: (relationId: string) => void
}
