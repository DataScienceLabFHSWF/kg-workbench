import {
  getClassPositions,
  getModuleLayouts,
  getOntologyClasses,
  getOntologyCQs,
  getOntologyDocument,
  getOntologyDocuments,
  getOntologyExamplesByOntology,
  getOntologyLanguages,
  getOntologyLocalizedTextsByOntology,
  getOntologyNotesByOntology,
  getOntologyLocalizedTexts,
  getOntologyRelations,
  getRelationAttributesByOntology,
} from "@/features/ontology/server/queries"
import { EmptyState } from "@/features/ontology/components/shared/empty-state"
import { OntologyHeader } from "@/features/ontology/components/ontology-header"
import { OntologyShell } from "@/features/ontology/components/ontology-shell"

interface OntologyPageProps {
  searchParams: Promise<{ doc?: string }>
}

export default async function OntologyPage({
  searchParams,
}: OntologyPageProps) {
  const { doc: docParam } = await searchParams
  const documents = await getOntologyDocuments()

  if (documents.length === 0) {
    return (
      <div className="flex h-screen flex-col">
        <OntologyHeader
          documents={documents}
          currentDocument={null}
          classes={[]}
          relations={[]}
          languages={[]}
          localizedTexts={[]}
          isVisual={false}
        />
        <div className="flex min-h-0 flex-1 items-center justify-center">
          <EmptyState
            title="No ontology documents"
            description="Create a new ontology or import an ontology JSON file to get started."
          />
        </div>
      </div>
    )
  }

  const currentDocId =
    docParam && documents.some((document) => document.id === docParam)
      ? docParam
      : documents[0].id
  const [
    currentDocument,
    classes,
    relations,
    savedPositions,
    savedModuleLayouts,
    languages,
    cqs,
    ontologyLocalizedTexts,
    allLocalizedTexts,
    notes,
    examples,
    relationAttributesByRelation,
  ] = await Promise.all([
    getOntologyDocument(currentDocId),
    getOntologyClasses(currentDocId),
    getOntologyRelations(currentDocId),
    getClassPositions(currentDocId),
    getModuleLayouts(currentDocId),
    getOntologyLanguages(currentDocId),
    getOntologyCQs(currentDocId),
    getOntologyLocalizedTexts({ type: "ontology", id: currentDocId }),
    getOntologyLocalizedTextsByOntology(currentDocId),
    getOntologyNotesByOntology(currentDocId),
    getOntologyExamplesByOntology(currentDocId),
    getRelationAttributesByOntology(currentDocId),
  ])

  return (
    <OntologyShell
      documents={documents}
      currentDocument={currentDocument}
      classes={classes}
      relations={relations}
      savedPositions={savedPositions}
      savedModuleLayouts={savedModuleLayouts}
      languages={languages}
      cqs={cqs}
      ontologyLocalizedTexts={ontologyLocalizedTexts}
      allLocalizedTexts={allLocalizedTexts}
      notes={notes}
      examples={examples}
      relationAttributesByRelation={relationAttributesByRelation}
    />
  )
}
