export function truncateWithEllipsis(text: string, maxLength: number) {
  if (text.length <= maxLength) return text
  return `${text.slice(0, maxLength).trimEnd()}...`
}

export function isTruncatedText(text: string, maxLength: number) {
  return text.length > maxLength
}
