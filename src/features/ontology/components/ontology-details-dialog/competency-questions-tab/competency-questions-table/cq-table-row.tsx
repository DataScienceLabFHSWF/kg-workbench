"use client"

import { MoreHorizontal, Pencil, Trash2 } from "lucide-react"

import type { OntologyExample, OntologyRelation } from "@/domain/ontology"
import type {
  OntologyClassWithAttributes,
  OntologyCQWithModules,
} from "@/features/ontology/server/queries"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { TableCell, TableRow } from "@/components/ui/table"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  isTruncatedText,
  truncateWithEllipsis,
} from "@/lib/truncate-with-ellipsis"

const ENTITY_NAME_PREVIEW_LENGTH = 28
const INSTANCE_NAME_PREVIEW_LENGTH = 20

function renderOptionalExampleText(
  example: OntologyExample | null | undefined,
  emptyLabel: string
) {
  if (!example) {
    return <span className="text-xs text-muted-foreground">{emptyLabel}</span>
  }

  return renderExampleBadge(example)
}

function renderExampleBadge(example: OntologyExample | null | undefined) {
  if (!example) {
    return <span className="text-sm text-muted-foreground">-</span>
  }

  const preview = truncateWithEllipsis(
    example.value,
    INSTANCE_NAME_PREVIEW_LENGTH
  )
  const content = (
    <Badge variant="outline" className="max-w-32 text-xs">
      <span className="block overflow-hidden text-ellipsis whitespace-nowrap">
        {preview}
      </span>
    </Badge>
  )

  if (!isTruncatedText(example.value, INSTANCE_NAME_PREVIEW_LENGTH)) {
    return content
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>{content}</TooltipTrigger>
      <TooltipContent side="top" align="start" className="max-w-80">
        {example.value}
      </TooltipContent>
    </Tooltip>
  )
}

interface CQTableRowProps {
  cq: OntologyCQWithModules
  classMap: Map<string, OntologyClassWithAttributes>
  relationMap: Map<string, OntologyRelation>
  exampleMap: Map<string, OntologyExample>
  onEdit: (cq: OntologyCQWithModules) => void
  onDelete: (cq: OntologyCQWithModules) => void
}

export function CQTableRow({
  cq,
  classMap,
  relationMap,
  exampleMap,
  onEdit,
  onDelete,
}: CQTableRowProps) {
  const subjectClass = cq.subject_class_id
    ? classMap.get(cq.subject_class_id)
    : null
  const predicateRelation = cq.predicate_relation_id
    ? relationMap.get(cq.predicate_relation_id)
    : null
  const objectClass = cq.object_class_id
    ? classMap.get(cq.object_class_id)
    : null
  const subjectInstance = cq.subject_example_id
    ? exampleMap.get(cq.subject_example_id)
    : null
  const objectInstance = cq.object_example_id
    ? exampleMap.get(cq.object_example_id)
    : null
  const predicateExample = cq.predicate_example_id
    ? exampleMap.get(cq.predicate_example_id)
    : null

  const subjectClassPreview = subjectClass
    ? truncateWithEllipsis(subjectClass.name, ENTITY_NAME_PREVIEW_LENGTH)
    : null
  const objectClassPreview = objectClass
    ? truncateWithEllipsis(objectClass.name, ENTITY_NAME_PREVIEW_LENGTH)
    : null

  return (
    <TableRow>
      <TableCell className="max-w-md">
        {cq.question ? (
          <p className="text-sm break-words whitespace-normal">{cq.question}</p>
        ) : (
          <span className="text-sm text-muted-foreground italic">
            No question
          </span>
        )}
      </TableCell>
      <TableCell>
        {cq.modules.length === 0 ? (
          <Badge variant="secondary" className="text-xs">
            Ontology-wide
          </Badge>
        ) : (
          <div className="flex flex-wrap gap-1">
            {cq.modules.map((m) => (
              <Badge key={m.id} variant="outline" className="text-xs">
                {m.name}
              </Badge>
            ))}
          </div>
        )}
      </TableCell>
      <TableCell className="max-w-48">
        <div className="flex flex-col gap-1">
          {subjectClass ? (
            subjectClassPreview !== subjectClass.name ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="block text-sm">{subjectClassPreview}</span>
                </TooltipTrigger>
                <TooltipContent side="top" align="start" className="max-w-80">
                  {subjectClass.name}
                </TooltipContent>
              </Tooltip>
            ) : (
              <span className="block text-sm">{subjectClassPreview}</span>
            )
          ) : (
            <span className="text-sm text-muted-foreground">Not set</span>
          )}
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] font-medium tracking-wider text-muted-foreground uppercase">
              Instance optional
            </span>
            {renderOptionalExampleText(subjectInstance, "Any instance")}
          </div>
        </div>
      </TableCell>
      <TableCell className="max-w-48">
        <div className="flex flex-col gap-1">
          {predicateRelation ? (
            <span className="text-sm">{predicateRelation.name}</span>
          ) : (
            <span className="text-sm text-muted-foreground">Not set</span>
          )}
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] font-medium tracking-wider text-muted-foreground uppercase">
              Example optional
            </span>
            {renderOptionalExampleText(predicateExample, "Any example")}
          </div>
        </div>
      </TableCell>
      <TableCell className="max-w-48">
        <div className="flex flex-col gap-1">
          {objectClass ? (
            objectClassPreview !== objectClass.name ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="block text-sm">{objectClassPreview}</span>
                </TooltipTrigger>
                <TooltipContent side="top" align="start" className="max-w-80">
                  {objectClass.name}
                </TooltipContent>
              </Tooltip>
            ) : (
              <span className="block text-sm">{objectClassPreview}</span>
            )
          ) : (
            <span className="text-sm text-muted-foreground">Not set</span>
          )}
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] font-medium tracking-wider text-muted-foreground uppercase">
              Instance optional
            </span>
            {renderOptionalExampleText(objectInstance, "Any instance")}
          </div>
        </div>
      </TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="size-7">
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(cq)}>
              <Pencil className="mr-2 size-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => onDelete(cq)}
            >
              <Trash2 className="mr-2 size-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  )
}
