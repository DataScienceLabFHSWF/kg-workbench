import { Badge } from "@/components/ui/badge"
import type { ExtractionRun } from "@/domain/documents"

interface ExtractionRunMetadataBadgesProps {
  run: ExtractionRun
}

const INTERNAL_PROVIDER_LABELS: Record<string, string> = {
  openai: "OpenAI",
  anthropic: "Anthropic",
  ollama: "Ollama",
}

export function ExtractionRunMetadataBadges({
  run,
}: ExtractionRunMetadataBadgesProps) {
  if (run.extractor_backend === "internal") {
    return (
      <div className="flex min-w-0 items-center gap-1">
        <Badge variant="outline" className="text-[10px]">
          Internal Extractor
        </Badge>
        {run.internal_provider ? (
          <Badge variant="secondary" className="text-[10px]">
            {INTERNAL_PROVIDER_LABELS[run.internal_provider] ??
              run.internal_provider}
          </Badge>
        ) : null}
        {run.internal_model_name ? (
          <Badge
            variant="secondary"
            className="max-w-48 truncate text-[10px]"
            title={run.internal_model_name}
          >
            {run.internal_model_name}
          </Badge>
        ) : null}
      </div>
    )
  }

  return (
    <div className="flex min-w-0 items-center gap-1">
      <Badge variant="outline" className="text-[10px]">
        External
      </Badge>
      {run.external_extractor_url ? (
        <Badge
          variant="secondary"
          className="max-w-48 truncate text-[10px]"
          title={run.external_extractor_url}
        >
          {getExternalEndpointLabel(run.external_extractor_url)}
        </Badge>
      ) : null}
    </div>
  )
}

function getExternalEndpointLabel(url: string) {
  try {
    return new URL(url).host
  } catch {
    return "Custom endpoint"
  }
}
