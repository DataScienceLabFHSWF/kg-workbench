# 04 - Import Preview

Status: `open`

## Goal

Show the user exactly what will change in the KG before they confirm: a summary table of the triples to be imported, a React Flow graph delta, and conflict/duplicate warnings.

## Slices

### Slice A — Import preview query (`src/features/documents/server/import-queries.ts`)

```ts
// Returns all data needed to render the preview step.
getImportPreview(documentId: string): Promise<ImportPreview>
```

`ImportPreview` shape:

```ts
interface ImportPreviewTriple {
  factId: string
  subjectText: string
  subjectKgNodeId: string | null // from entity_resolutions
  subjectIsNew: boolean
  predicateLabel: string // from ontology relation
  objectText: string
  objectKgNodeId: string | null
  objectIsNew: boolean
  status: "new" | "existing" | "conflict"
}

interface ImportPreview {
  triples: ImportPreviewTriple[]
  neighbourhood: KgGraph // from kgAdapter.getNeighbourhood(resolvedNodeIds)
  conflictCount: number
  newNodeCount: number
}
```

Conflict detection logic:

- For each triple where both subject and object are resolved to existing KG nodes, check if that `(subjectId, predicateLabel, objectId)` combination already exists in the neighbourhood edges.
- If yes → `status: 'conflict'`; if no → `status: 'new'` or `status: 'existing'`.

### Slice B — Summary table

Create `src/features/documents/components/import-preview/preview-table.tsx`:

- Table columns: Subject → (existing node label or "New") | Relation | Object → (existing node label or "New") | Status badge
- Status badges: `new` (accent), `existing` (muted), `conflict` (destructive)
- Warning banner at top if `conflictCount > 0`: "X conflict(s) detected. Review before importing."

### Slice C — Graph delta view

Create `src/features/documents/components/import-preview/preview-graph.tsx` (React Flow client component):

- Existing KG neighbourhood nodes: neutral/muted colour
- New triples: accent colour for nodes and edges
- Conflict edges: destructive/red colour
- Read-only canvas (no drag-to-edit)
- Use dagre for auto-layout (already installed)

### Slice D — Preview step wiring

Create `src/features/documents/components/import-preview/index.tsx`:

- Tabs: "Table" | "Graph"
- Warning banner (if conflicts)
- "← Back" and "Next: Confirm →" buttons

Wire into `src/app/documents/[id]/import/page.tsx` as Step 2. Call `getImportPreview` server-side, pass as props.

## Files to create/modify

- `src/features/documents/server/import-queries.ts` — create
- `src/features/documents/components/import-preview/index.tsx` — create
- `src/features/documents/components/import-preview/preview-table.tsx` — create
- `src/features/documents/components/import-preview/preview-graph.tsx` — create
- `src/app/documents/[id]/import/page.tsx` — wire Step 2

## Verification

- Summary table renders all accepted facts with correct status badges
- Conflict detection flags the right triples against mock KG neighbourhood
- Graph delta renders with correct node/edge colouring
- Tab switching works
- Warning banner appears only when `conflictCount > 0`
- `pnpm lint && pnpm typecheck` pass
