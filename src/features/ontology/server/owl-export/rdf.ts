export const RDF_NS = "http://www.w3.org/1999/02/22-rdf-syntax-ns#"
export const RDFS_NS = "http://www.w3.org/2000/01/rdf-schema#"
export const OWL_NS = "http://www.w3.org/2002/07/owl#"
export const XSD_NS = "http://www.w3.org/2001/XMLSchema#"
export const KG_NS = "https://kg-workbench.local/ontology#"

export function escapeXmlText(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
}

export function escapeXmlAttribute(value: string) {
  return escapeXmlText(value).replace(/"/g, "&quot;")
}

export function appendLiteralElement(
  lines: string[],
  indent: string,
  tagName: string,
  value: string | null | undefined,
  languageCode?: string | null
) {
  const trimmed = value?.trim()
  if (!trimmed) return
  const languageAttribute = languageCode?.trim()
    ? ` xml:lang="${escapeXmlAttribute(languageCode)}"`
    : ""
  lines.push(
    `${indent}<${tagName}${languageAttribute}>${escapeXmlText(trimmed)}</${tagName}>`
  )
}

export function appendResourceElement(
  lines: string[],
  indent: string,
  tagName: string,
  resourceIri: string
) {
  lines.push(
    `${indent}<${tagName} rdf:resource="${escapeXmlAttribute(resourceIri)}"/>`
  )
}
