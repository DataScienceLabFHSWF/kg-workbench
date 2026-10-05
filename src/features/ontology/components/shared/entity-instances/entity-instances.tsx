"use client"

import { useTransition } from "react"
import { Info } from "lucide-react"
import { toast } from "sonner"

import type { OntologyExample } from "@/domain/ontology"
import type { OntologyExampleCandidateTarget } from "@/features/ontology/server/queries"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

import { ExamplesEditor } from "../examples-editor/examples-editor"

interface EntityInstancesProps {
  ontologyId: string
  target: OntologyExampleCandidateTarget
  instancePolicy: string
  examples: OntologyExample[]
  instanceCandidateLabel: string
  candidatePluralLabel: string
  onInstancePolicyChange: (nextPolicy: string) => Promise<unknown>
}

const INSTANCE_POLICIES = [
  { value: "open", label: "Open" },
  { value: "controlled", label: "Controlled" },
] as const

export function EntityInstances({
  ontologyId,
  target,
  instancePolicy,
  examples,
  instanceCandidateLabel,
  candidatePluralLabel,
  onInstancePolicyChange,
}: EntityInstancesProps) {
  const [isPending, startTransition] = useTransition()

  function handlePolicyChange(nextPolicy: string) {
    startTransition(async () => {
      try {
        await onInstancePolicyChange(nextPolicy)
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Save failed.")
      }
    })
  }

  return (
    <section className="space-y-6">
      <div>
        <div className="mb-1 flex items-center gap-1">
          <p className="text-xs font-medium text-muted-foreground">
            Instance policy
          </p>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                className="text-muted-foreground"
                aria-label="Explain instance policy"
              >
                <Info className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top" align="start" className="max-w-80">
              <div className="space-y-1.5">
                <p>
                  Defines how strongly extraction should stay within examples
                  marked as {candidatePluralLabel} for this{" "}
                  {target.type === "class" ? "class" : "relation"}.
                </p>
                <p>
                  <strong>Open:</strong> only guides extraction toward these
                  examples.
                </p>
                <p>
                  <strong>Controlled:</strong> other examples should be
                  excluded.
                </p>
              </div>
            </TooltipContent>
          </Tooltip>
        </div>
        <Select
          value={instancePolicy || "open"}
          onValueChange={handlePolicyChange}
          disabled={isPending}
        >
          <SelectTrigger className="h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {INSTANCE_POLICIES.map((policy) => (
              <SelectItem key={policy.value} value={policy.value}>
                {policy.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <ExamplesEditor
        ontologyId={ontologyId}
        target={target}
        examples={examples}
        mode={target.type === "class" ? "value" : "triple"}
        instanceCandidateLabel={instanceCandidateLabel}
      />
    </section>
  )
}
