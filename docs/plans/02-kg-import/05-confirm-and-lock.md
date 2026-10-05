# 05 - Confirm & Lock

Status: `open`

## Goal

Execute the import (send triples to the KG adapter), mark the document as `imported`, and prevent further review edits.

## Slices

### Slice A — Confirm import server action

Add to `src/features/documents/server/import-actions.ts`:

```ts
confirmImport(documentId: string): Promise<{ importedCount: number }>
```

Steps:

1. Load all accepted facts for the document (via existing query)
2. Load `entity_resolutions` for the document
3. Build `KgTriple[]`: for each accepted fact, look up subject and object resolutions; skip facts with unresolved entities (guard)
4. Call `kgAdapter.importTriples(triples)`
5. Update `documents.status` → `'imported'`
6. Revalidate relevant cache paths (`/documents`, `/documents/[id]/import`)
7. Return `{ importedCount }`

### Slice B — Confirm step UI

Create `src/features/documents/components/import-confirm/index.tsx` (client component):

- Summary: "X triples will be imported. Y new nodes will be created."
- Conflict warning (if any): "Z conflicts detected — these triples already exist in the graph and will be skipped."
- "Confirm Import" button — calls `confirmImport` via server action, shows loading state
- On success: display success message + "Back to Documents" link
- On error: display error toast (use `sonner`)

Wire into `src/app/documents/[id]/import/page.tsx` as Step 3.

### Slice C — Lock review UI for imported documents

- In `src/features/documents/components/document-browser/`: hide/disable review navigation for `imported` documents
- In the document review screen (wherever fact review controls are rendered): check `document.status === 'imported'` and render a read-only banner — "This document has been imported. Facts are locked."
- Disable all fact review action buttons (`reviewFact`, `remapFact`, `renameFactPart`, etc.) when document is imported — guard at the server action level as well

## Files to modify

- `src/features/documents/server/import-actions.ts` — add `confirmImport`
- `src/features/documents/components/import-confirm/index.tsx` — create
- `src/app/documents/[id]/import/page.tsx` — wire Step 3
- Document review screen components — add imported lock guard
- `src/features/documents/server/actions.ts` — add import status guard to review actions

## Verification

- `confirmImport` calls mock adapter and updates document status in DB
- Document appears as `imported` in the browser after confirming
- Import button no longer appears for imported documents
- Review actions are disabled/hidden for imported documents
- Read-only banner appears in the review screen for imported documents
- `pnpm lint && pnpm build` pass
