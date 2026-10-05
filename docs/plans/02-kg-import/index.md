# 02 - KG Import Plan

## Overview

Add the final step of the document review workflow: importing accepted facts from a document into an external Neo4j knowledge graph. The flow covers triggering the import, resolving entities against the existing graph, previewing the delta, and locking the document after import.

### Key decisions

- **Trigger**: "Import" button in the documents list, visible for `in_review` documents with ≥1 accepted fact.
- **Import page**: `/documents/[id]/import` — a dedicated 3-step page (entity resolution → preview → confirm).
- **Entity resolution**: Per unique subject/object text, deduplicated. User maps each string to an existing KG node or marks it as new. Mappings persist in the DB so work survives page reloads.
- **Preview**: Summary table + React Flow graph delta (existing neighbourhood in neutral, new triples highlighted, conflicts flagged).
- **KG adapter**: Mock-first, same pattern as `extraction-adapter.ts`. May later be replaced by an internal Next.js API endpoint.
- **Locking**: After import, document status → `imported`; review actions disabled in the UI for imported documents.

---

## Sub-plans

| #   | Plan                                                                                 | Status |
| --- | ------------------------------------------------------------------------------------ | ------ |
| 1   | [KG Adapter](./01-kg-adapter.md) — Type definitions + mock adapter                   | `open` |
| 2   | [Import Page Shell](./02-import-page-shell.md) — Route, layout, trigger button       | `open` |
| 3   | [Entity Resolution](./03-entity-resolution.md) — DB table, server actions, UI step   | `open` |
| 4   | [Import Preview](./04-preview.md) — Summary table, graph delta, conflict detection   | `open` |
| 5   | [Confirm & Lock](./05-confirm-and-lock.md) — Import action, document lock, UI guards | `open` |
