---
feature: ontology-import
status: active
purpose: Import ontology JSON into database records, including structure, metadata, examples, competency questions, and visual state.
scope:
  - ontology document creation
  - structure persistence for modules, classes, relations, and relation attributes
  - competency-question and metadata persistence
  - example and visual-state restoration
entry_points:
  - path: src/features/ontology/server/actions/ontology-transfer/import-ontology-from-json/index.ts
    purpose: Stable public entry for ontology JSON import.
server_entry_points:
  - path: src/features/ontology/server/actions/ontology-transfer/import-ontology-from-json/import-ontology-from-json.ts
    purpose: Orchestrate full ontology import and route revalidation.
  - path: src/features/ontology/server/actions/ontology-transfer/import-ontology-from-json/persist-ontology-structure.ts
    purpose: Create the ontology document and persist structural records in dependency order.
  - path: src/features/ontology/server/actions/ontology-transfer/import-ontology-from-json/persist-competency-questions.ts
    purpose: Recreate competency questions and module links after structural IDs exist.
  - path: src/features/ontology/server/actions/ontology-transfer/import-ontology-from-json/append-visual-inserts.ts
    purpose: Restore saved module layouts and class positions when visual data is present.
update_this_readme_when:
  - import order changes
  - warning behavior changes
  - supported imported record types change
---

# Domain Concepts

- `import id map`: mapping from source JSON IDs to newly inserted database IDs
- `pending CQ example ref`: competency-question example reference updated after examples are inserted
- `visual insert`: saved module layout or class position recreated from imported JSON

# Flow

1. `import-ontology-from-json.ts` parses and validates the uploaded file, then orchestrates the import stages.
2. `persist-ontology-structure.ts` creates the ontology document, languages, modules, classes, relations, and relation attributes.
3. `persist-competency-questions.ts` inserts competency questions and module links once structural ID maps exist.
4. `persist-import-metadata.ts` and `persist-import-examples.ts` restore localized texts, notes, examples, and CQ example references.
5. `append-visual-inserts.ts` restores module layouts and class positions, then the route is revalidated.

# Constraints

- Preserve dependency order so referenced records exist before they are linked.
- Treat unresolved references as warnings when possible instead of failing the whole import.
- Keep the final imported shape compatible with ontology export round-trips.
