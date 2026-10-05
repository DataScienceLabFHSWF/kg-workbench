export function normalizeComparableName(name: string) {
  return name.trim().toLocaleLowerCase()
}

export function hasDuplicateModuleName(
  name: string,
  existingModuleNames: string[],
  currentName?: string
) {
  const normalizedName = normalizeComparableName(name)
  const normalizedCurrent = currentName
    ? normalizeComparableName(currentName)
    : null

  return existingModuleNames.some((existingName) => {
    const normalizedExisting = normalizeComparableName(existingName)
    if (normalizedExisting === normalizedCurrent) return false
    return normalizedExisting === normalizedName
  })
}

export function suggestUniqueModuleName(
  name: string,
  existingModuleNames: string[]
) {
  const trimmed = name.trim()
  if (!trimmed) return ""
  if (!hasDuplicateModuleName(trimmed, existingModuleNames)) return trimmed

  const baseCopyName = `${trimmed} Copy`
  if (!hasDuplicateModuleName(baseCopyName, existingModuleNames)) {
    return baseCopyName
  }

  let suffix = 2
  let candidate = `${baseCopyName} ${suffix}`
  while (hasDuplicateModuleName(candidate, existingModuleNames)) {
    suffix += 1
    candidate = `${baseCopyName} ${suffix}`
  }

  return candidate
}

export function validateModuleName(
  name: string,
  existingModuleNames: string[],
  currentName?: string
) {
  const trimmed = name.trim()
  if (!trimmed) return "Name is required."
  if (hasDuplicateModuleName(trimmed, existingModuleNames, currentName)) {
    return `Module "${trimmed}" already exists.`
  }
  return null
}
