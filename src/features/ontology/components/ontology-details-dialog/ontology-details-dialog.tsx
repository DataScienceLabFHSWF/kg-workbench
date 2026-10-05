"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { CompetencyQuestionsTab } from "./competency-questions-tab/competency-questions-tab"
import { LanguagesTab } from "./languages-tab/languages-tab"
import { NotesTab } from "./notes-tab"
import { OverviewTab } from "./overview-tab"
import type { OntologyDetailsDialogProps, OntologyDetailsTab } from "./types"

const TAB_DESCRIPTIONS: Record<OntologyDetailsTab, string> = {
  overview:
    "Edit ontology metadata through the language-aware editor and choose the canonical default language.",
  languages: "Manage the ontology languages used for metadata translations.",
  "competency-questions":
    "Review competency questions and the classes and relations they cover. The extracted KG can be filtered by these.",
  notes: "Capture ontology-level notes for this document.",
}

export function OntologyDetailsDialog({
  open,
  onOpenChange,
  activeTab,
  onActiveTabChange,
  ontology,
  classes,
  relations,
  languages,
  cqs,
  examples,
  ontologyLocalizedTexts,
  ontologyNotes,
  cqCreateModuleId,
  cqCreateRequestId,
  cqFilterModuleId,
  cqFilterRequestId,
}: OntologyDetailsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[calc(100vh-2rem)] max-h-[960px] w-[calc(100vw-2rem)] max-w-none flex-col overflow-hidden sm:max-w-none 2xl:max-w-[1680px]">
        <DialogHeader className="shrink-0">
          <DialogTitle>{ontology.name}</DialogTitle>
          <DialogDescription>{TAB_DESCRIPTIONS[activeTab]}</DialogDescription>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={(value) =>
            onActiveTabChange(value as typeof activeTab)
          }
          className="flex min-h-0 flex-1 flex-col"
        >
          <TabsList className="shrink-0 justify-start">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="languages">Languages</TabsTrigger>
            <TabsTrigger value="competency-questions">
              Competency Questions
            </TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
          </TabsList>

          <TabsContent
            value="overview"
            className="min-h-0 flex-1 overflow-y-auto"
          >
            <OverviewTab
              ontology={ontology}
              languages={languages}
              ontologyLocalizedTexts={ontologyLocalizedTexts}
            />
          </TabsContent>

          <TabsContent
            value="languages"
            className="min-h-0 flex-1 overflow-y-auto"
          >
            <LanguagesTab ontology={ontology} languages={languages} />
          </TabsContent>

          <TabsContent
            value="competency-questions"
            className="min-h-0 flex-1 overflow-y-auto"
          >
            <CompetencyQuestionsTab
              key={`cq-tab-${cqCreateRequestId ?? 0}-${cqFilterRequestId ?? 0}-${cqFilterModuleId ?? "all"}`}
              ontology={ontology}
              modules={ontology.modules}
              classes={classes}
              relations={relations}
              cqs={cqs}
              examples={examples}
              createModuleId={cqCreateModuleId}
              createRequestId={cqCreateRequestId}
              filterModuleId={cqFilterModuleId}
            />
          </TabsContent>

          <TabsContent value="notes" className="min-h-0 flex-1 overflow-y-auto">
            <NotesTab ontology={ontology} notes={ontologyNotes} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
