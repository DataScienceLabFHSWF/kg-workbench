# 03 - Entity Resolution

Status: `open`

## Goal

Allow users to map each unique subject/object text string from accepted facts to an existing KG node (or mark it as a new node). Mappings persist in the DB.

## Slices

### Slice A — DB migration

Add table `entity_resolutions`:

```sql
create table entity_resolutions (
  id          uuid primary key default gen_random_uuid(),
  document_id uuid not null references documents(id) on delete cascade,
  text_key    text not null,          -- the raw subject/object text
  kg_node_id  text,                   -- null until resolved
  is_new      boolean not null default false,
  created_at  timestamptz not null default now(),
  unique (document_id, text_key)
);
```

Update `src/types/database.types.ts` with the new table shape (manual update until Supabase types are regenerated).

### Slice B — Server actions (`src/features/documents/server/import-actions.ts`)

```ts
// Collect all unique subject/object texts from accepted facts for a document,
// upsert entity_resolutions rows (skip already-resolved ones).
initEntityResolution(documentId: string): Promise<EntityResolution[]>

// Save a user's mapping of a text to an existing KG node.
resolveEntity(documentId: string, textKey: string, kgNodeId: string): Promise<void>

// Mark a text as a brand-new node (no existing KG node to link).
markEntityAsNew(documentId: string, textKey: string): Promise<void>

// Reset a resolution back to unresolved.
clearEntityResolution(documentId: string, textKey: string): Promise<void>

// Thin wrapper around kgAdapter.searchEntities — callable from server actions.
searchKgEntities(query: string): Promise<KgEntity[]>
```

Add `EntityResolution` type to `src/types/documents.ts`.

### Slice C — Entity resolution UI

Create `src/features/documents/components/entity-resolution/index.tsx` (client component):

Layout:

- Header: "Step 1: Entity Resolution" + progress chip "X / N resolved"
- List of `EntityResolutionRow` components, one per unique text
- "Next: Preview →" button, disabled until all texts are resolved

`entity-resolution-row.tsx`:

- Left: text label (the raw subject/object string)
- Right: combobox — search existing KG nodes (debounced call to `searchKgEntities`) + "Mark as new" option
- Resolved state: show selected KG node label (or "New node") + clear button

Wire into `src/app/documents/[id]/import/page.tsx` as Step 1. Call `initEntityResolution` on page load (server-side), pass results as props.

## Files to create/modify

- Supabase migration — create `entity_resolutions` table
- `src/types/database.types.ts` — add table type
- `src/types/documents.ts` — add `EntityResolution` type
- `src/features/documents/server/import-actions.ts` — create with ER actions
- `src/features/documents/components/entity-resolution/index.tsx` — create
- `src/features/documents/components/entity-resolution/entity-resolution-row.tsx` — create
- `src/app/documents/[id]/import/page.tsx` — wire Step 1

## Verification

- ER list shows correct deduplicated texts for a test document
- Combobox returns mock results from KG adapter
- Mapping a text updates the DB row (confirmed via Supabase dashboard or query)
- Mappings persist across page reload
- Progress counter updates correctly
- "Next" button disabled until all resolved
- `pnpm lint && pnpm typecheck` pass
