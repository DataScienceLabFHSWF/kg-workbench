"use client"

import { useState } from "react"
import { Check, Copy, Download, FileJson, Info } from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import {
  ENDPOINT_CONTRACTS,
  type CodeReference,
  type ContractSectionId,
  type EndpointId,
} from "@/features/documents/components/upload-document-dialog/external-extraction-api-contract-data"
import { downloadTextFile } from "@/features/ontology/components/export-ontology-dialog/export-utils"

interface ExternalExtractionApiContractDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ExternalExtractionApiContractDialog({
  open,
  onOpenChange,
}: ExternalExtractionApiContractDialogProps) {
  const [endpointId, setEndpointId] = useState<EndpointId>("trigger")
  const [sectionId, setSectionId] = useState<ContractSectionId>("request")
  const endpoint =
    ENDPOINT_CONTRACTS.find((contract) => contract.id === endpointId) ??
    ENDPOINT_CONTRACTS[0]
  const selectedSection = endpoint[sectionId]

  function handleEndpointChange(value: string) {
    if (!value) return

    setEndpointId(value as EndpointId)
    setSectionId("request")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[calc(100vh-2rem)] max-h-[960px] w-[calc(60vw-2rem)] max-w-none flex-col overflow-hidden sm:max-w-none 2xl:max-w-[1680px]">
        <DialogHeader className="shrink-0 space-y-2">
          <div className="flex items-center gap-2">
            <FileJson className="size-4 text-muted-foreground" />
            <DialogTitle>External extractor API</DialogTitle>
          </div>
          <DialogDescription>
            Reference contract for compatible external extraction services.
          </DialogDescription>
        </DialogHeader>

        <div className="flex min-h-0 flex-1 flex-col gap-3">
          <ToggleGroup
            type="single"
            variant="outline"
            spacing={0}
            value={endpointId}
            onValueChange={handleEndpointChange}
            className="grid w-full shrink-0 grid-cols-3 bg-muted p-[3px]"
          >
            {ENDPOINT_CONTRACTS.map((contract) => (
              <ToggleGroupItem
                key={contract.id}
                value={contract.id}
                className="min-w-0 border-border data-[state=on]:bg-background data-[state=on]:text-foreground data-[state=on]:shadow-sm"
              >
                {contract.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>

          <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden rounded-md border bg-muted/25 p-4">
            <div className="grid shrink-0 gap-3 md:grid-cols-[minmax(0,1fr)_12rem] md:items-start">
              <div className="flex min-w-0 items-start gap-2 text-sm">
                <Info className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                <div className="min-w-0 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline">{endpoint.method}</Badge>
                    <code className="rounded-sm bg-background px-1.5 py-0.5 text-xs">
                      {endpoint.path}
                    </code>
                  </div>
                  <p className="text-muted-foreground">
                    {endpoint.description}
                  </p>
                </div>
              </div>

              <Select
                value={sectionId}
                onValueChange={(value) =>
                  setSectionId(value as ContractSectionId)
                }
              >
                <SelectTrigger aria-label="Contract direction">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="request">Request</SelectItem>
                  <SelectItem value="response">Response</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <ContractCodeTabs section={selectedSection} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

interface ContractCodeTabsProps {
  section: {
    example: CodeReference
    schema: CodeReference
  }
}

function ContractCodeTabs({ section }: ContractCodeTabsProps) {
  return (
    <Tabs defaultValue="example" className="flex min-h-0 flex-1 flex-col gap-3">
      <TabsList className="grid w-full shrink-0 grid-cols-2">
        <TabsTrigger value="example">Example</TabsTrigger>
        <TabsTrigger value="schema">Schema</TabsTrigger>
      </TabsList>

      <TabsContent value="example" className="mt-0 min-h-0">
        <ReferenceCodePanel reference={section.example} />
      </TabsContent>

      <TabsContent value="schema" className="mt-0 min-h-0">
        <ReferenceCodePanel reference={section.schema} />
      </TabsContent>
    </Tabs>
  )
}

interface ReferenceCodePanelProps {
  reference: CodeReference
}

function ReferenceCodePanel({ reference }: ReferenceCodePanelProps) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(reference.content)
      setCopied(true)
      toast.success(`${reference.fileName} copied.`)
      window.setTimeout(() => setCopied(false), 1500)
    } catch {
      toast.error("Could not copy JSON.")
    }
  }

  function handleDownload() {
    downloadTextFile(reference.fileName, reference.content, "application/json")
    toast.success(`${reference.fileName} downloaded.`)
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-3">
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-2">
        <code className="min-w-0 truncate text-xs text-muted-foreground">
          {reference.fileName}
        </code>
        <div className="flex shrink-0 gap-2">
          <Button variant="outline" size="sm" onClick={handleCopy}>
            {copied ? (
              <Check className="mr-2 h-4 w-4" />
            ) : (
              <Copy className="mr-2 h-4 w-4" />
            )}
            Copy
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownload}>
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
        </div>
      </div>

      <Textarea
        readOnly
        aria-label={reference.fileName}
        spellCheck={false}
        value={reference.content}
        className="min-h-0 flex-1 resize-none overflow-auto overscroll-contain rounded-md bg-background font-mono leading-5 whitespace-pre"
      />
    </div>
  )
}
