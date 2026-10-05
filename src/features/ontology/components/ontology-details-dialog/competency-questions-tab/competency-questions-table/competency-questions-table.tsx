"use client"

import type {
  OntologyExample,
  OntologyModule,
  OntologyRelation,
} from "@/domain/ontology"
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type {
  OntologyClassWithAttributes,
  OntologyCQWithModules,
  OntologyDocumentWithModules,
} from "@/features/ontology/server/queries"

import { CQInlineEditorRow } from "../cq-inline-editor-row/cq-inline-editor-row"
import { CQTableRow } from "./cq-table-row"

interface CompetencyQuestionsTableProps {
  ontology: OntologyDocumentWithModules
  modules: OntologyModule[]
  classes: OntologyClassWithAttributes[]
  relations: OntologyRelation[]
  filteredCQs: OntologyCQWithModules[]
  classMap: Map<string, OntologyClassWithAttributes>
  relationMap: Map<string, OntologyRelation>
  exampleMap: Map<string, OntologyExample>
  editingCQId: string | null
  showCreateRow: boolean
  createRowKey: string
  initialModuleId: string | null
  onCloseCreateRow: () => void
  onEdit: (cq: OntologyCQWithModules) => void
  onStopEdit: () => void
  onDelete: (cq: OntologyCQWithModules) => void
}

export function CompetencyQuestionsTable({
  ontology,
  modules,
  classes,
  relations,
  filteredCQs,
  classMap,
  relationMap,
  exampleMap,
  editingCQId,
  showCreateRow,
  createRowKey,
  initialModuleId,
  onCloseCreateRow,
  onEdit,
  onStopEdit,
  onDelete,
}: CompetencyQuestionsTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-60">Question</TableHead>
          <TableHead className="w-40">Modules</TableHead>
          <TableHead>Subject</TableHead>
          <TableHead>Predicate</TableHead>
          <TableHead>Object</TableHead>
          <TableHead className="w-12" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {showCreateRow && (
          <CQInlineEditorRow
            key={createRowKey}
            ontology={ontology}
            modules={modules}
            classes={classes}
            relations={relations}
            initialModuleId={initialModuleId}
            onCancel={onCloseCreateRow}
            onSaved={onCloseCreateRow}
          />
        )}
        {filteredCQs.map((cq) =>
          cq.id === editingCQId ? (
            <CQInlineEditorRow
              key={`edit-${cq.id}`}
              ontology={ontology}
              modules={modules}
              classes={classes}
              relations={relations}
              editingCQ={cq}
              onCancel={onStopEdit}
              onSaved={onStopEdit}
            />
          ) : (
            <CQTableRow
              key={cq.id}
              cq={cq}
              classMap={classMap}
              relationMap={relationMap}
              exampleMap={exampleMap}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          )
        )}
      </TableBody>
    </Table>
  )
}
