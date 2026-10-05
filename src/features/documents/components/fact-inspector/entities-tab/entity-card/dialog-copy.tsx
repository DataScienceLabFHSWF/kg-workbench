"use client"

import type { ReactNode } from "react"

import { APP_COLOR_CLASSES } from "@/lib/colors"
import { cn } from "@/lib/utils"

type DialogType = "class-clear" | "class-assign" | "relation-break"

interface EntityCardDialogCopyOptions {
  dialogType: DialogType | null
  affectedFactsCount: number
  currentClassName: string | null
  pendingClassName: string | null
}

export function getEntityCardDialogCopy({
  dialogType,
  affectedFactsCount,
  currentClassName,
  pendingClassName,
}: EntityCardDialogCopyOptions): {
  title: string
  description: ReactNode
  confirmLabel: string
} | null {
  if (!dialogType) return null

  const countLabel =
    affectedFactsCount === 1 ? "fact" : `${affectedFactsCount} facts`

  if (dialogType === "class-clear") {
    return {
      title: "Remove class from entity",
      description: (
        <p>
          This entity is currently classified as{" "}
          <span className="font-medium">{currentClassName}</span>. Removing the
          class will make it unclassified in the following {countLabel}:
        </p>
      ),
      confirmLabel: "Remove class",
    }
  }

  if (dialogType === "class-assign") {
    return {
      title: "Assign class to entity",
      description: (
        <p>
          Assigning <span className="font-medium">{pendingClassName}</span> will
          classify this entity in the following {countLabel}:
        </p>
      ),
      confirmLabel: "Assign class",
    }
  }

  return {
    title: "Class change breaks existing relations",
    description: (
      <p>
        The following{" "}
        {affectedFactsCount === 1 ? "fact has" : `${countLabel} have`} a
        relation type that is incompatible with the new class. Their relation
        mapping will be cleared and they will become{" "}
        <span className={cn("font-medium", APP_COLOR_CLASSES.warningText)}>
          Unmapped
        </span>
        .
      </p>
    ),
    confirmLabel: "Change class",
  }
}
