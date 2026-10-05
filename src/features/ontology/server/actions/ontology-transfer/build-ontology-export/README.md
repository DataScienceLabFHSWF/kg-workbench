---
feature: ontology-export
status: active
purpose: Build ontology JSON export payloads from selected ontology modules, classes, relations, and visual state.
scope:
  - export selection filtering
  - export payload serialization
  - export mapper functions for notes and examples
  - optional visual layout export
entry_points:
  - path: src/features/ontology/server/actions/ontology-transfer/build-ontology-export/index.ts
    purpose: Stable public entry for ontology export building.
server_entry_points:
  - path: src/features/ontology/server/actions/ontology-transfer/build-ontology-export/index.ts
    purpose: Orchestrate query loading, selection narrowing, and final schema validation.
  - path: src/features/ontology/server/actions/ontology-transfer/build-ontology-export/build-ontology-export-payload.ts
    purpose: Serialize the final ontology export payload from prepared query results.
  - path: src/features/ontology/server/actions/ontology-transfer/build-ontology-export/export-filters.ts
    purpose: Decide which competency questions and examples belong in the export.
update_this_readme_when:
  - export payload structure changes
  - selection rules change
  - visual export behavior changes
---

# Domain Concepts

- `export selection`: caller-provided module, class, and relation IDs that define the export scope
- `relevant module`: module included directly or indirectly because exported classes belong to it
- `visual export`: saved module layouts and class positions attached to the JSON payload

# Flow

1. `index.ts` loads ontology document data, structure, metadata, examples, CQs, and saved visual state.
2. `export-filters.ts` narrows competency questions and examples to records that still fit the selected export graph.
3. `build-ontology-export-payload.ts` serializes modules, classes, relations, relation attributes, CQs, metadata, and optional visual data.
4. `export-mappers.ts` converts note and example rows into import-compatible JSON records.
5. The final payload is schema-validated before returning to `src/features/ontology/server/actions/ontology-transfer/index.ts`.

# Constraints

- Export only relations whose domain and range classes are both still in scope.
- Keep the payload import-compatible so ontology round-trips remain stable.
- Respect export-language fallback versus strict translation behavior.
