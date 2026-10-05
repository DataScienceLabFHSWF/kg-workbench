# 02 - Import Page Shell

Status: `open`

## Goal

Add the import route and surface the import trigger in the documents list. No business logic yet — just routing, layout, and navigation.

## Slices

### Slice A — Route and page

Create `src/app/documents/[id]/import/page.tsx`:

- Server component
- Load document by `id` (reuse existing query from `src/features/documents/server/queries/`)
- If document is not `in_review`, redirect to `/documents`
- Render a page shell with:
  - Header: document title + "Import to Knowledge Graph" subtitle
  - Back link → `/documents` (or back to the review screen)
  - Placeholder sections for the 3 steps (entity resolution, preview, confirm)
  - Step indicator (1 / 2 / 3) — static for now

### Slice B — Import trigger button in document browser

Modify `src/features/documents/components/document-browser/`:

- Add an "Import" button (or icon button with tooltip) on document rows/cards where:
  - `document.status === 'in_review'`
  - At least 1 accepted fact exists (pass `acceptedFactCount` from the server query)
- Button navigates to `/documents/[id]/import`
- Update `fetchDocuments` query (or add a companion query) to include `accepted_fact_count` via a `count` on `facts` filtered by `review_status = 'accepted'`

### Slice C — Imported status in document browser

- Update `src/features/documents/components/shared/doc-status-badge.tsx` to handle `imported` status with a distinct badge style
- Disable the "Import" button and any review-navigation links for `imported` documents

## Files to modify

- `src/app/documents/[id]/import/page.tsx` — create
- `src/features/documents/components/document-browser/` — add trigger
- `src/features/documents/components/shared/doc-status-badge.tsx` — add `imported` variant
- `src/features/documents/server/queries/` — add `accepted_fact_count`

## Verification

- Navigating to `/documents/[id]/import` renders the shell without errors
- Import button visible for correct document states only
- Imported badge renders for imported documents
- `pnpm lint && pnpm typecheck` pass
