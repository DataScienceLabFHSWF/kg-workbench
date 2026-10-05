---
feature: documents
status: active
purpose: Review extracted document facts, inspect source text, and drive entity/relation cleanup before import.
scope:
  - document list, upload, and extraction kickoff
  - reader, table of contents, fact inspector, and fact graph
  - document-scoped entity, attribute, and fact review state
entry_points:
  - path: src/app/(app)/knowledge-graph/page.tsx
    purpose: Server route that loads the initial document list.
  - path: src/features/documents/components/documents-shell/documents-shell.tsx
    purpose: Client shell that coordinates the three-panel workspace.
server_entry_points:
  - path: src/features/documents/server/queries/
    purpose: Focused read layer and client-callable query functions for documents, sections, facts, entities, extraction runs, and ontology context.
  - path: src/features/documents/server/actions/
    purpose: Focused write actions for document records, extraction lifecycle, fact review, and entity cleanup.
update_this_readme_when:
  - route composition changes
  - data flow or extraction lifecycle changes
  - new subareas are added under this feature
---

# Documents

## Domain Concepts

- `document`: extracted source record plus overall review status; the original
  upload is retained only when persistent storage is configured
- `group scope`: every document, extraction run, and review artifact belongs to one access group and is only visible within that group
- `shared workspace`: unprotected local mode and protected shared-password mode use `shared`; configured password groups remain separate
- `section`: logical document chunk used by reader and TOC
- `paragraph`: smallest text unit used for navigation and evidence linking
- `extraction run`: one pipeline execution for a document and ontology
- `fact`: extracted subject-relation-object statement under review
- `entity`: normalized document mention that facts can point to
- `evidence anchor`: stored quote/context backing a fact

## Flow

1. `src/app/(app)/knowledge-graph/page.tsx` loads the document list on the server and passes it into `DocumentsShell`.
2. `DocumentsShell` hosts the workspace provider, while `src/features/documents/hooks/documents-workspace-state.tsx` manages shared selection, paragraph/section navigation, graph highlight state, sync mode, panel state per view, and the shared toolbar filters (`Status`, `Chapter`, `Module`, `Chapter Scope`, `Module Scope`, `Attributes`, plus expandable ontology and extracted groups with subject/object class and entity rows, relation, and extracted relation filters) through one reducer-backed client context.
3. `document-browser-panel.tsx` hosts document selection, upload, and TOC access through `DocumentBrowser`, and remains available as a collapsible left panel in reader, graph, and table modes.
4. `document-workspace-header` renders the current document title, metadata badges, and the `Reader / Graph / Table` switcher above the shared filters row for every mode.
5. `document-filters-toolbar` renders the shared workspace filter bar above the reader, graph, table, and inspector area; the compact first row keeps chapter and module selection visible while expandable ontology/extracted groups expose relation plus stacked subject/object role filters that the reader, inspector, graph mode, and fact table mode all consume.
6. `document-reader-panel.tsx` renders the reader and swaps in `FactGraphView` for graph mode, while `sync-toggle-strip.tsx` controls reader and inspector sync behavior.
7. `fact-inspector-panel.tsx` hosts `FactInspector` for fact, entity, relation, and CQ review as a collapsible right panel in all modes, and consumes the same document-level filters as the shared toolbar and graph.
8. Upload and extraction mutations use the backend selected in `src/features/documents/components/upload-document-dialog/`: internal extraction sends the selected provider, model, and optional one-time API key to the internal service, while external extraction sends the document request to the configured or user-entered extractor URL with an optional one-time API key. Each extracted entity carries its ontology class directly so isolated entities and their class-scoped attributes can be persisted without relying on a relationship fact. The internal fallback preserves obvious source sections before extraction and uses lexical chunk links plus optional LLM section labels for evidence anchors. The app records extractor provenance on the extraction run, persists returned results locally, then refreshes the review UI from the DB-backed state.
   When `STORAGE_PROVIDER=none`, the uploaded original is sent to the extractor
   but is not retained after that request.

## Review Rules

- mapped facts can only be accepted when required relation attributes are filled and the linked subject/object entities are not missing required class attributes
- entity cards surface missing required class attributes as editable empty rows before optional attributes
- the inspector `CQs` tab previews ontology competency questions against the current shared filters and can apply CQ-specific subject/object/relation filters into the workspace after clearing broad class/entity filters

## Constraints

- when a component needs subcomponents, prefer a folder like `components/<name>/<name>.tsx` for new work and keep related parts in separate files
- all server reads and writes in this feature must stay scoped to the current access group via the root `document`
