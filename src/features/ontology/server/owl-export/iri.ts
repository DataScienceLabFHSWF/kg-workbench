import { normalizeOwlBaseIri } from "@/features/ontology/utils/owl-base-iri"

export function slugifyIriSegment(value: string, fallback: string) {
  const normalized = value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Za-z0-9._~-]+/g, "-")
    .replace(/^-+|-+$/g, "")

  return normalized || fallback
}

export function joinOwlIri(baseIri: string, ...segments: string[]) {
  return `${normalizeOwlBaseIri(baseIri)}${segments.join("/")}`
}

export function claimUniqueIriSegment({
  fallback,
  name,
  stableId,
  usedSegments,
}: {
  fallback: string
  name: string
  stableId: string | null | undefined
  usedSegments: Set<string>
}) {
  const baseSegment = slugifyIriSegment(name, fallback)
  if (!usedSegments.has(baseSegment)) {
    usedSegments.add(baseSegment)
    return baseSegment
  }

  const suffix = slugifyIriSegment(stableId ?? fallback, fallback).slice(0, 8)
  const suffixedSegment = `${baseSegment}-${suffix}`
  if (!usedSegments.has(suffixedSegment)) {
    usedSegments.add(suffixedSegment)
    return suffixedSegment
  }

  let index = 2
  while (usedSegments.has(`${suffixedSegment}-${index}`)) index += 1

  const nextSegment = `${suffixedSegment}-${index}`
  usedSegments.add(nextSegment)
  return nextSegment
}
