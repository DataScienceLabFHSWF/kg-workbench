"use client"

import { useQuery } from "@tanstack/react-query"

import {
  getInstanceCandidateExamples,
  type OntologyExampleCandidateTarget,
} from "@/features/ontology/server/queries"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface ExampleCandidateSelectProps {
  target: OntologyExampleCandidateTarget | null
  value: string | null
  onValueChange: (id: string | null) => void
  placeholder?: string
  emptyMessage?: string
}

const NO_EXAMPLE_VALUE = "__none__"

export function ExampleCandidateSelect({
  target,
  value,
  onValueChange,
  placeholder = "Select instance (optional)",
  emptyMessage = "No allowed examples defined yet.",
}: ExampleCandidateSelectProps) {
  const { data: examples = [], isLoading } = useQuery({
    queryKey: [
      "ontology",
      "instance-candidate-examples",
      target?.type,
      target?.id,
    ],
    queryFn: () => getInstanceCandidateExamples(target!),
    enabled: Boolean(target),
  })

  if (!target) return null

  if (!isLoading && examples.length === 0) {
    return <p className="text-xs text-muted-foreground">{emptyMessage}</p>
  }

  return (
    <Select
      value={value ?? NO_EXAMPLE_VALUE}
      onValueChange={(nextValue) =>
        onValueChange(nextValue === NO_EXAMPLE_VALUE ? null : nextValue)
      }
      disabled={isLoading}
    >
      <SelectTrigger className="h-8">
        <SelectValue placeholder={isLoading ? "Loading..." : placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={NO_EXAMPLE_VALUE}>None</SelectItem>
        {examples.map((example) => (
          <SelectItem key={example.id} value={example.id}>
            {example.value}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
