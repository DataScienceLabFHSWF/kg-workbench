"use client"

import { Info } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
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
import { ALL_LANGUAGES_EXPORT } from "@/features/ontology/utils/export-language"

import type {
  ExportLanguageOption,
  MissingTranslationBehavior,
  MissingTranslationSummary,
} from "@/features/ontology/components/export-ontology-dialog/types"

interface LanguageControlsProps {
  defaultLanguage: string
  exportLanguage: string
  exportLanguageOptions: ExportLanguageOption[]
  languageHelpText?: string
  languageLabel?: string
  missingTranslationBehavior: MissingTranslationBehavior
  missingTranslationSummary: MissingTranslationSummary | null
  missingTranslationSummaryText: string | null
  onExportLanguageChange: (language: string) => void
  onMissingTranslationBehaviorChange: (
    behavior: MissingTranslationBehavior
  ) => void
}

export function LanguageControls({
  defaultLanguage,
  exportLanguage,
  exportLanguageOptions,
  languageHelpText,
  languageLabel = "Export language",
  missingTranslationBehavior,
  missingTranslationSummary,
  missingTranslationSummaryText,
  onExportLanguageChange,
  onMissingTranslationBehaviorChange,
}: LanguageControlsProps) {
  const showMissingTranslationControls =
    missingTranslationSummary !== null &&
    exportLanguage !== defaultLanguage &&
    exportLanguage !== ALL_LANGUAGES_EXPORT

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="w-[160px] space-y-1.5">
        <div className="flex items-center gap-1">
          <Label htmlFor="export-language">{languageLabel}</Label>
          {languageHelpText ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  className="shrink-0 text-muted-foreground"
                  aria-label={`${languageLabel} details`}
                >
                  <Info />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top" align="start" className="max-w-72">
                {languageHelpText}
              </TooltipContent>
            </Tooltip>
          ) : null}
        </div>
        <Select value={exportLanguage} onValueChange={onExportLanguageChange}>
          <SelectTrigger id="export-language" className="w-full">
            <SelectValue placeholder="Select language" />
          </SelectTrigger>
          <SelectContent align="end">
            {exportLanguageOptions.map((language) => (
              <SelectItem key={language.code} value={language.code}>
                {language.label}
                {language.code === defaultLanguage ? " (default)" : ""}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {showMissingTranslationControls ? (
        <div className="w-[280px] space-y-1.5">
          <div className="flex items-center gap-1">
            <Label htmlFor="missing-translation-behavior">Missing Values</Label>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  className="shrink-0 text-muted-foreground"
                  aria-label="Show missing translation details"
                >
                  <Info />
                </Button>
              </TooltipTrigger>
              <TooltipContent
                side="bottom"
                align="end"
                className="max-w-[32rem]"
              >
                <div className="max-h-[24rem] overflow-y-auto pr-2 text-left text-xs">
                  <div className="space-y-3">
                    {missingTranslationSummaryText ? (
                      <p>{missingTranslationSummaryText}</p>
                    ) : null}
                    {missingTranslationSummary.classGroups.length > 0 ? (
                      <div className="space-y-1.5">
                        <p className="font-medium">Classes</p>
                        {missingTranslationSummary.classGroups.map((group) => (
                          <div key={`class-${group.moduleLabel}`}>
                            <p className="font-medium text-muted-foreground">
                              {group.moduleLabel}
                            </p>
                            {group.entries.map((entry) => (
                              <p key={entry.id}>
                                {entry.label}: {entry.missingFields.join(", ")}
                              </p>
                            ))}
                          </div>
                        ))}
                      </div>
                    ) : null}
                    {missingTranslationSummary.relationGroups.length > 0 ? (
                      <div className="space-y-1.5">
                        <p className="font-medium">Relations</p>
                        {missingTranslationSummary.relationGroups.map(
                          (group) => (
                            <div key={`relation-${group.moduleLabel}`}>
                              <p className="font-medium text-muted-foreground">
                                {group.moduleLabel}
                              </p>
                              {group.entries.map((entry) => (
                                <p key={entry.id}>
                                  {entry.label}:{" "}
                                  {entry.missingFields.join(", ")}
                                </p>
                              ))}
                            </div>
                          )
                        )}
                      </div>
                    ) : null}
                    {missingTranslationSummary.otherCount > 0 ? (
                      <p>
                        Plus {missingTranslationSummary.otherCount} missing
                        values across ontology, modules, or attributes.
                      </p>
                    ) : null}
                  </div>
                </div>
              </TooltipContent>
            </Tooltip>
          </div>

          <Select
            value={missingTranslationBehavior}
            onValueChange={(value) =>
              onMissingTranslationBehaviorChange(
                value as MissingTranslationBehavior
              )
            }
          >
            <SelectTrigger id="missing-translation-behavior" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="end">
              <SelectItem value="fallback">
                Use default language as fallback
              </SelectItem>
              <SelectItem value="strict">Leave Values Empty</SelectItem>
            </SelectContent>
          </Select>
        </div>
      ) : null}
    </div>
  )
}
