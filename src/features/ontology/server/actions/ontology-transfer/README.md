---
feature: ontology-transfer
status: active
purpose: Coordinate ontology JSON export and import flows plus the shared helper logic they depend on.
scope:
  - ontology JSON export orchestration
  - ontology JSON import orchestration
  - shared helper utilities for localization, module resolution, and file naming
  - import/export result contracts for ontology transfer actions
entry_points:
  - path: src/features/ontology/server/actions/ontology-transfer/index.ts
    purpose: Public server-action entry for ontology export and ontology import.
server_entry_points:
  - path: src/features/ontology/server/actions/ontology-transfer/build-ontology-export/
    purpose: Build validated ontology export payloads from selected ontology data.
  - path: src/features/ontology/server/actions/ontology-transfer/import-ontology-from-json/
    purpose: Parse ontology JSON and persist the imported ontology into database records.
  - path: src/features/ontology/server/actions/ontology-transfer/helpers/
    purpose: Shared pure helpers for import/export resolution and localization handling.
  - path: src/features/ontology/server/actions/ontology-transfer/types.ts
    purpose: Shared request and response contracts for ontology transfer actions.
update_this_readme_when:
  - import or export entry points change
  - a new ontology transfer subarea is added
  - cross-folder transfer responsibilities move
---

# Domain Concepts

- `ontology transfer`: full-document JSON export/import flow for ontology data
- `export payload`: validated JSON representation returned for download
- `import orchestration`: ordered persistence flow that recreates ontology records from JSON
- `shared helper`: pure utility reused by both import and export branches

# Flow

1. `index.ts` exposes the public API used by the ontology feature for full ontology export and import.
2. `build-ontology-export/` loads ontology data, filters the requested scope, serializes the payload, and validates the result.
3. `import-ontology-from-json/` parses uploaded JSON, persists structural and metadata records in order, restores visual state, and revalidates the ontology route.
4. `helpers/` provides shared utilities for localization lookups, module resolution, and deterministic export values and file names.
5. `types.ts` keeps import/export action contracts aligned across the folder.

# Constraints

- Keep `index.ts` as the stable public boundary for ontology transfer actions.
- Keep export payloads compatible with the import flow so round-trips remain reliable.
- Prefer pure helpers in `helpers/` and keep database writes inside the import/export subfolders.
