---
feature: document-filters-toolbar
status: active
purpose: Render the shared document review filter bar and translate fetched document data into selector options.
scope:
  - compact first-row controls for status, chapter, module, chapter scope, module scope, and attributes
  - expandable ontology and extracted groups with stacked role-based class and entity controls
  - relation, module, and extracted relation controls for the expanded row
  - graph-only `Isolate nodes` display toggle in the shared toolbar
  - role-row add/remove behavior for subject and object class/entity filters
  - grouped and nested option shaping for toolbar selectors
  - dispatching normalized filter changes back to the documents shell
entry_points:
  - path: src/features/documents/components/shared/document-filters-toolbar/document-filters-toolbar.tsx
    purpose: Client toolbar component that fetches document context and wires filter controls.
  - path: src/features/documents/components/shared/document-filters-toolbar/utils/index.ts
    purpose: Public helper surface that re-exports toolbar select and option-building utilities.
server_entry_points: []
update_this_readme_when:
  - filter controls are added, removed, or renamed
  - toolbar data dependencies or option-building rules change
  - this folder gains a new public entry component
---

# Document Filters Toolbar

## Domain Concepts

- `shared document filters`: the single source of truth used by reader, inspector, and graph views
- `isolate nodes`: a graph-view display mode that hides relation edges and narrows the graph to the selected entity or class when one is active
- `grouped select`: flat options organized under module buckets for classes and ontology relations
- `nested select`: tree-grouped options for concrete entities and extracted relations, including subject/object role-specific entity filters, while both the open list and closed field show only the selected relation or entity name
- `role row stack`: a vertically stacked role filter that starts at one `All` control and can expand with a second row for the missing subject or object role
- `role-specific filters`: subject/object class and entity filters that now anchor the visible toolbar UI and CQ application

## Flow

1. `document-filters-toolbar.tsx` loads document sections, facts, entities, and ontology context with React Query for the selected document.
2. Local helpers in `utils/` normalize selected values, preserve current selections, and build grouped or nested selector options from the fetched data, using breadcrumb paths for grouping and search while the UI shows only the leaf values.
3. Toolbar subcomponents emit normalized filter values through the callbacks owned by the surrounding documents shell state.
4. The top toolbar keeps a compact first row of labeled controls, including module selection, plus a chevron toggle and a reset action labeled with the current active filter count.
5. The expanded row renders grouped `Ontology` and `Extracted` sections, with relation and stacked subject/object role rows for class and entity filters.
6. CQ actions inside the inspector clear broad class/entity filters first, then apply relation and subject/object-specific filters through the same shared toolbar state.
7. The `Isolate nodes` switch only appears in graph mode and only changes graph rendering.

## Constraints

- keep toolbar-specific option shaping in this folder instead of pushing UI-only transformations into shared document filter utilities
- preserve `DOCUMENT_FILTER_ALL` behavior consistently across every selector
- keep nested and grouped select rendering inside the dedicated toolbar subcomponents
