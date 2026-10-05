import { DocumentsShell } from "@/features/documents/components/documents-shell"
import { getDocuments } from "@/features/documents/server/queries"

export const dynamic = "force-dynamic"

export default async function KnowledgeGraphPage() {
  const documents = await getDocuments()
  return <DocumentsShell initialDocuments={documents} />
}
