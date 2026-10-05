export const routes = {
  access: {
    root: "/access",
  },
  ontology: {
    root: "/ontology",
    document: (id: string) => `/ontology?doc=${encodeURIComponent(id)}`,
    module: (documentId: string, moduleId: string) =>
      `/ontology/${documentId}/modules/${moduleId}`,
  },
  knowledgeGraph: {
    root: "/knowledge-graph",
    document: (id: string) => `/knowledge-graph/${id}`,
  },
} as const
