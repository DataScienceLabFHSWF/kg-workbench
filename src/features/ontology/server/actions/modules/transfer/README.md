---
feature: ontology-module-transfer
status: active
purpose: Build, validate, and persist module transfer payloads for module export, import, and duplication.
scope:
  - module JSON payload assembly
  - module transfer warning analysis
  - module transfer persistence into ontology tables
  - transfer-specific target mapping and insert resolution
entry_points:
  - path: src/features/ontology/server/actions/modules/transfer/index.ts
    purpose: Stable public entry for module transfer helpers used by module actions.
server_entry_points:
  - path: src/features/ontology/server/actions/modules/transfer/build-module-transfer-payload.ts
    purpose: Collect module-scoped ontology data and serialize it into transfer JSON.
  - path: src/features/ontology/server/actions/modules/transfer/persist-module-transfer-payload.ts
    purpose: Recreate transferred module data inside the current ontology document.
  - path: src/features/ontology/server/actions/modules/transfer/analyze-module-transfer.ts
    purpose: Compute pre-import warnings for missing parent, relation, and relation-attribute references.
update_this_readme_when:
  - transfer payload shape changes
  - warning behavior changes
  - persistence order or target resolution rules change
---

# Domain Concepts

- `module transfer payload`: JSON representation of one ontology module and its dependent records
- `target mapping`: translation from source IDs in JSON to new database IDs after import
- `warning`: non-fatal issue reported when a reference cannot be recreated safely

# Flow

1. `index.ts` exposes the transfer helpers to `src/features/ontology/server/actions/modules/index.ts`.
2. `build-module-transfer-payload.ts` loads module-scoped classes, relations, metadata, examples, and CQs from ontology queries.
3. `module-transfer-mappers.ts` normalizes database rows into transfer payload records.
4. `analyze-module-transfer.ts` checks uploaded JSON for broken references before persistence.
5. `persist-module-transfer-payload.ts` inserts the new module, recreates linked records in dependency order, resolves transferred IDs, and returns warnings.

# Constraints

- Keep the public exports in `index.ts` stable so module actions do not need import changes.
- Preserve warning semantics for unresolved references during import and duplicate flows.
- Maintain insertion order so later records only resolve IDs that were already created.
