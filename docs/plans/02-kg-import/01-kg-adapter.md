# 01 - KG Adapter

Status: `open`

## Goal

Define the interface for communicating with the external knowledge graph and provide a mock implementation. Follows the same pattern as `src/server/external/extraction-adapter.ts`.

## Slices

### Slice A — Type definitions (`src/server/external/kg-import.ts`)

Define the contract for the KG adapter:

```ts
export interface KgEntity {
  id: string
  label: string
  type: string // maps to an ontology class name
}

export interface KgNode {
  id: string
  label: string
  type: string
}

// User question: Do we need KgEntity AND KgNode as they have the same structure?

export interface KgEdge {
  id: string
  sourceId: string
  targetId: string
  label: string // relation name
}

export interface KgGraph {
  nodes: KgNode[]
  edges: KgEdge[]
}

export interface KgTriple {
  subjectId: string | null // null → create new node
  subjectLabel: string
  predicateId: string // maps to ontology relation id
  predicateLabel: string
  objectId: string | null // null → create new node
  objectLabel: string
}

export interface KgImportResult {
  importedCount: number
  createdNodeIds: string[] // IDs of newly created KG nodes
  skippedCount: number // already-existing duplicates
}

export interface KgAdapterInterface {
  searchEntities(query: string): Promise<KgEntity[]>
  getNeighbourhood(entityIds: string[]): Promise<KgGraph>
  importTriples(triples: KgTriple[]): Promise<KgImportResult>
}
```

### Slice B — Mock adapter (`src/server/external/kg-adapter.ts`)

Implement `KgAdapterInterface` with stub data:

- `searchEntities`: returns 3–5 hardcoded entities filtered by query substring
- `getNeighbourhood`: returns a small static graph (3 nodes, 2 edges) regardless of input
- `importTriples`: logs input, returns `{ importedCount: triples.length, createdNodeIds: [], skippedCount: 0 }`

Export a singleton: `export const kgAdapter: KgAdapterInterface = new MockKgAdapter()`

## Verification

- `pnpm typecheck` passes
- Mock adapter satisfies the interface (TypeScript structural check)
- All three methods return the correct shape
