---
feature: ontology-transfer-helpers
status: active
purpose: Provide shared helper functions for ontology JSON import and export flows.
scope:
  - file-name normalization
  - imported module name and ID resolution
  - localized text keying and filtering
  - export-time localized value resolution
entry_points:
  - path: src/features/ontology/server/actions/ontology-transfer/helpers/index.ts
    purpose: Stable public entry for helper utilities shared by ontology transfer subflows.
server_entry_points:
  - path: src/features/ontology/server/actions/ontology-transfer/helpers/module-resolution.ts
    purpose: Resolve imported module references from legacy IDs or names.
  - path: src/features/ontology/server/actions/ontology-transfer/helpers/localized-texts.ts
    purpose: Build localized-text lookup maps and exportable localized-text payloads.
  - path: src/features/ontology/server/actions/ontology-transfer/helpers/export-values.ts
    purpose: Resolve canonical or translated field values for export.
update_this_readme_when:
  - helper responsibilities change
  - localized text key format changes
  - import/export resolution rules change
---

# Domain Concepts

- `localized text key`: composite identifier for one translated field on one ontology target
- `legacy module id`: module identifier coming from imported JSON rather than the current database
- `export value`: final string emitted into JSON after translation fallback or strict resolution

# Flow

1. `index.ts` re-exports helper functions for import and export server actions.
2. `module-resolution.ts` derives module records or fallback legacy modules during import.
3. `localized-texts.ts` turns stored localized text rows into lookup maps or export arrays.
4. `export-values.ts` resolves canonical versus translated values based on export language rules.
5. `file-name.ts` provides deterministic JSON file naming for exports.

# Constraints

- Keep helpers pure and side-effect free.
- Keep shared types narrow so import and export folders can reuse the same contracts.
- Preserve current localized text key format because export/import logic depends on it.
