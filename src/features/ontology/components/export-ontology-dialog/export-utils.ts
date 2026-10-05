export {
  NO_MODULE_GROUP_KEY,
  getDefaultModuleSelection,
  sortModuleGroups,
  updateSet,
} from "@/features/ontology/utils/module-selection"

export function downloadJsonFile(fileName: string, payload: unknown) {
  downloadTextFile(
    fileName,
    JSON.stringify(payload, null, 2),
    "application/json"
  )
}

export function downloadTextFile(
  fileName: string,
  content: string,
  type = "text/plain;charset=utf-8"
) {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
