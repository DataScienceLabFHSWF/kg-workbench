import { z } from "zod"

import {
  ImportCompetencyQuestionSchema,
  ImportExampleSchema,
  ImportLocalizedTextSchema,
  ImportNoteSchema,
  ImportAttributeSchema,
  ImportRelationAttributeSchema,
  ImportRelationSchema,
} from "@/features/ontology/schemas/import"

export const ModuleTransferClassSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().default(""),
  parentClassId: z.string().nullable().optional(),
  attributes: z.array(ImportAttributeSchema).default([]),
})

export const ModuleTransferSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  description: z.string().default(""),
  classes: z.array(ModuleTransferClassSchema).default([]),
  relations: z.array(ImportRelationSchema).default([]),
  relationAttributes: z.array(ImportRelationAttributeSchema).default([]),
  competencyQuestions: z.array(ImportCompetencyQuestionSchema).default([]),
  notes: z.array(ImportNoteSchema).default([]),
  examples: z.array(ImportExampleSchema).default([]),
  localizedTexts: z.array(ImportLocalizedTextSchema).default([]),
})

export type ModuleTransferClass = z.infer<typeof ModuleTransferClassSchema>
export type ModuleTransfer = z.infer<typeof ModuleTransferSchema>
