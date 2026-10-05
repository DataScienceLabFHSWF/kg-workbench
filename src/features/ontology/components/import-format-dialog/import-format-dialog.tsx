"use client"

import { FileJson, Info } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ONTOLOGY_IMPORT_EXAMPLE_FILE_NAME,
  ONTOLOGY_IMPORT_SCHEMA_FILE_NAME,
  ontologyImportDetailSections,
  ontologyImportExampleJson,
  ontologyImportQuickStart,
  ontologyImportSchemaJson,
} from "@/features/ontology/schemas/import-format"
import { ImportFormatCodeCard } from "@/features/ontology/components/shared/import-format-code-card/import-format-code-card"

interface ImportFormatDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ImportFormatDialog({
  open,
  onOpenChange,
}: ImportFormatDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[calc(100vh-2rem)] max-h-[960px] w-[calc(60vw-2rem)] max-w-none flex-col overflow-hidden sm:max-w-none 2xl:max-w-[1680px]">
        <DialogHeader className="shrink-0 space-y-2">
          <div className="flex items-center gap-2">
            <FileJson className="size-4 text-muted-foreground" />
            <DialogTitle>Ontology import format</DialogTitle>
          </div>
          <DialogDescription>
            Share the schema and example with users or agents when they need to
            adapt an ontology JSON file for KG Workbench.
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto pr-1">
          <section className="rounded-lg border bg-muted/25 p-4">
            <div className="flex items-start gap-2">
              <Info className="mt-0.5 size-4 text-muted-foreground" />
              <div className="space-y-2">
                <h3 className="font-medium">Quick start</h3>
                <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                  {ontologyImportQuickStart.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          <Tabs
            defaultValue="example"
            className="flex min-h-0 flex-col space-y-4"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="example">Example</TabsTrigger>
              <TabsTrigger value="schema">Schema</TabsTrigger>
            </TabsList>

            <TabsContent value="example" className="mt-0 min-h-0">
              <ImportFormatCodeCard
                title="Example JSON"
                description="A concise import example that touches the main ontology structures and optional metadata."
                fileName={ONTOLOGY_IMPORT_EXAMPLE_FILE_NAME}
                content={ontologyImportExampleJson}
                badge={<Badge variant="secondary">Starter</Badge>}
                className="h-[28rem]"
                contentClassName="flex-1"
              />
            </TabsContent>

            <TabsContent value="schema" className="mt-0 min-h-0">
              <ImportFormatCodeCard
                title="Schema JSON"
                description="A machine-readable reference for the canonical ontology import shape."
                fileName={ONTOLOGY_IMPORT_SCHEMA_FILE_NAME}
                content={ontologyImportSchemaJson}
                badge={<Badge variant="outline">Reference</Badge>}
                className="h-[28rem]"
                contentClassName="flex-1"
              />
            </TabsContent>
          </Tabs>

          <section className="space-y-2">
            {ontologyImportDetailSections.map((section) => (
              <Collapsible
                key={section.title}
                className="rounded-lg border bg-card px-4 py-3"
              >
                <CollapsibleTrigger className="flex w-full items-center justify-between gap-3 text-left">
                  <span className="font-medium">{section.title}</span>
                  <span className="text-xs text-muted-foreground">
                    Show details
                  </span>
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-3">
                  <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
                    {section.bullets.map((bullet) => (
                      <li key={bullet}>{bullet}</li>
                    ))}
                  </ul>
                </CollapsibleContent>
              </Collapsible>
            ))}
          </section>
        </div>
      </DialogContent>
    </Dialog>
  )
}
