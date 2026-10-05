"use client"

import { useState, type ReactNode } from "react"
import { Plus, X } from "lucide-react"

import { Button } from "@/components/ui/button"

import { DOCUMENT_FILTER_ALL } from "../../../utils/document-filters"
import { DocumentFiltersToolbarSelect } from "./document-filters-toolbar-select"

type DocumentFilterRole = typeof DOCUMENT_FILTER_ALL | "subject" | "object"

const ROLE_OPTIONS = [
  { value: "subject", label: "Subject" },
  { value: "object", label: "Object" },
] as const

interface DocumentFiltersToolbarRoleFilterStackProps {
  label: string
  disabled?: boolean
  allActive: boolean
  subjectActive: boolean
  objectActive: boolean
  onMoveSelection: (
    fromRole: DocumentFilterRole,
    toRole: DocumentFilterRole
  ) => void
  onClearRole: (role: DocumentFilterRole) => void
  renderValueControl: (role: DocumentFilterRole) => ReactNode
}

export function DocumentFiltersToolbarRoleFilterStack({
  label,
  disabled = false,
  allActive,
  subjectActive,
  objectActive,
  onMoveSelection,
  onClearRole,
  renderValueControl,
}: DocumentFiltersToolbarRoleFilterStackProps) {
  const [preferredRole, setPreferredRole] = useState<"subject" | "object">(
    "subject"
  )
  const [showSecondary, setShowSecondary] = useState(false)

  const hasDualRoleFilters = subjectActive && objectActive
  const effectivePrimaryRole: DocumentFilterRole =
    allActive && !subjectActive && !objectActive
      ? DOCUMENT_FILTER_ALL
      : hasDualRoleFilters
        ? preferredRole
        : subjectActive
          ? "subject"
          : objectActive
            ? "object"
            : showSecondary
              ? preferredRole
              : DOCUMENT_FILTER_ALL
  const secondaryRole = effectivePrimaryRole === "object" ? "subject" : "object"
  const hasVisibleSecondary =
    effectivePrimaryRole !== DOCUMENT_FILTER_ALL &&
    (showSecondary || hasDualRoleFilters)

  function handlePrimaryRoleChange(nextValue: string) {
    const nextRole =
      nextValue === DOCUMENT_FILTER_ALL
        ? DOCUMENT_FILTER_ALL
        : nextValue === "object"
          ? ("object" as const)
          : ("subject" as const)
    if (nextRole === effectivePrimaryRole) {
      return
    }

    if (nextRole === DOCUMENT_FILTER_ALL) {
      setShowSecondary(false)
      onMoveSelection(effectivePrimaryRole, nextRole)
      return
    }

    if (hasVisibleSecondary) {
      setPreferredRole(nextRole)
      return
    }

    onMoveSelection(effectivePrimaryRole, nextRole)
    setPreferredRole(nextRole)
  }

  function handleSecondaryRoleChange(nextValue: string) {
    const nextRole =
      nextValue === "object" ? ("object" as const) : ("subject" as const)
    if (nextRole === secondaryRole) {
      return
    }

    setPreferredRole(secondaryRole)
  }

  return (
    <div className="flex min-w-0 flex-col gap-1">
      <span className="px-1 text-[11px] font-medium text-muted-foreground">
        {label}
      </span>

      <div className="flex flex-col gap-2">
        <div className="flex items-start gap-2">
          <DocumentFiltersToolbarSelect
            label={`${label} role`}
            options={ROLE_OPTIONS.map((option) => ({ ...option }))}
            selectedValue={effectivePrimaryRole}
            disabled={disabled}
            hideFieldLabel
            allLabel="All"
            selectAllValue={DOCUMENT_FILTER_ALL}
            onChange={handlePrimaryRoleChange}
          />
          <div className="min-w-0 flex-1">
            {renderValueControl(effectivePrimaryRole)}
          </div>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="mt-0.5 h-9 w-9 shrink-0"
            disabled={
              disabled ||
              hasVisibleSecondary ||
              effectivePrimaryRole === DOCUMENT_FILTER_ALL
            }
            onClick={() => {
              if (effectivePrimaryRole !== DOCUMENT_FILTER_ALL) {
                setPreferredRole(effectivePrimaryRole)
              }
              setShowSecondary(true)
            }}
            aria-label={`Add ${secondaryRole} ${label.toLowerCase()} filter`}
          >
            <Plus className="size-4" />
          </Button>
        </div>

        {hasVisibleSecondary ? (
          <div className="flex items-start gap-2">
            <DocumentFiltersToolbarSelect
              label={`${label} role`}
              options={ROLE_OPTIONS.map((option) => ({ ...option }))}
              selectedValue={secondaryRole}
              disabled={disabled}
              hideFieldLabel
              onChange={handleSecondaryRoleChange}
            />
            <div className="min-w-0 flex-1">
              {renderValueControl(secondaryRole)}
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="mt-0.5 h-9 w-9 shrink-0 text-muted-foreground"
              disabled={disabled}
              onClick={() => {
                setShowSecondary(false)
                onClearRole(secondaryRole)
              }}
              aria-label={`Remove ${secondaryRole} ${label.toLowerCase()} filter`}
            >
              <X className="size-4" />
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  )
}
