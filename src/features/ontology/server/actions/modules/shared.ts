export function normalizeComparableName(name: string): string {
  return name.trim().toLocaleLowerCase()
}

export function sanitizeFileName(value: string): string {
  const normalized = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")

  return normalized || "ontology"
}

export function buildCopyModuleName(name: string): string {
  return `${name.trim()} Copy`
}

export function buildMissingRelationWarning(relationName: string): string {
  return `Skipped relation "${relationName}" because it references classes outside the uploaded module JSON.`
}

export function buildMissingParentWarning(
  className: string,
  parentClassId: string
): string {
  return `Imported class "${className}" without parent because "${parentClassId}" is missing from the uploaded module JSON.`
}
