const BASE_IRI_PATTERN = /^(https?:\/\/|urn:)/i

export function isValidOwlBaseIri(value: string) {
  return BASE_IRI_PATTERN.test(value.trim())
}

export function normalizeOwlBaseIri(value: string) {
  const trimmed = value.trim()

  if (!isValidOwlBaseIri(trimmed)) {
    throw new Error("Base IRI must start with http://, https://, or urn:.")
  }

  return /[\/#:]/.test(trimmed.at(-1) ?? "") ? trimmed : `${trimmed}/`
}
