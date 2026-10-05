"use client"

import { Settings2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import type {
  OntologyExample,
  OntologyModule,
  OntologyRelation,
} from "@/domain/ontology"
import type {
  OntologyClassWithAttributes,
  OntologyCQWithModules,
} from "@/features/ontology/server/queries"

interface ModuleCQSummaryProps {
  module: OntologyModule
  cqs: OntologyCQWithModules[]
  classes: OntologyClassWithAttributes[]
  relations: OntologyRelation[]
  examples: OntologyExample[]
  onAddCQ: () => void
  onManageCQs: () => void
}

function formatPattern(
  cq: OntologyCQWithModules,
  classMap: Map<string, OntologyClassWithAttributes>,
  relationMap: Map<string, OntologyRelation>,
  exampleMap: Map<string, OntologyExample>
) {
  const subject = cq.subject_class_id
    ? (classMap.get(cq.subject_class_id)?.name ?? "Unknown subject")
    : null
  const predicate = cq.predicate_relation_id
    ? (relationMap.get(cq.predicate_relation_id)?.name ?? "Unknown predicate")
    : null
  const object = cq.object_class_id
    ? (classMap.get(cq.object_class_id)?.name ?? "Unknown object")
    : null
  const subjectExample = cq.subject_example_id
    ? exampleMap.get(cq.subject_example_id)?.value
    : null
  const predicateExample = cq.predicate_example_id
    ? exampleMap.get(cq.predicate_example_id)?.value
    : null
  const objectExample = cq.object_example_id
    ? exampleMap.get(cq.object_example_id)?.value
    : null

  function formatSegment(
    label: string | null | undefined,
    example: string | null | undefined
  ) {
    if (!label) return null
    return example ? `${label} (${example})` : label
  }

  return [
    formatSegment(subject, subjectExample),
    formatSegment(predicate, predicateExample),
    formatSegment(object, objectExample),
  ]
    .filter(Boolean)
    .join(" / ")
}

export function ModuleCQSummary({
  module,
  cqs,
  classes,
  relations,
  examples,
  onAddCQ,
  onManageCQs,
}: ModuleCQSummaryProps) {
  const moduleCQs = cqs.filter((cq) =>
    cq.modules.some((cqModule) => cqModule.id === module.id)
  )
  const classMap = new Map(classes.map((cls) => [cls.id, cls]))
  const relationMap = new Map(
    relations.map((relation) => [relation.id, relation])
  )
  const exampleMap = new Map(examples.map((example) => [example.id, example]))

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs font-medium text-muted-foreground">
            Competency questions
          </p>
        </div>
        <div className="flex shrink-0 gap-1">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onManageCQs}
          >
            <Settings2 className="mr-1.5 h-3.5 w-3.5" />
            Manage
          </Button>
        </div>
      </div>

      {moduleCQs.length > 0 ? (
        <div className="space-y-2">
          {moduleCQs.slice(0, 6).map((cq) => {
            const pattern = formatPattern(cq, classMap, relationMap, exampleMap)
            return (
              <div key={cq.id} className="rounded-md border p-3">
                <p className="line-clamp-2 text-sm">{cq.question}</p>
                {pattern ? (
                  <p className="mt-1 text-xs break-words text-muted-foreground">
                    {pattern}
                  </p>
                ) : null}
              </div>
            )
          })}
          {moduleCQs.length > 6 ? (
            <p className="text-xs text-muted-foreground">
              {moduleCQs.length - 6} more in the full CQ manager.
            </p>
          ) : null}
        </div>
      ) : (
        <div className="rounded-md border border-dashed p-3">
          <p className="text-sm text-muted-foreground">
            No competency questions are linked to this module.
          </p>
          <Button
            type="button"
            variant="link"
            size="sm"
            className="mt-1 h-auto p-0"
            onClick={onAddCQ}
          >
            Add competency question
          </Button>
        </div>
      )}
    </section>
  )
}
