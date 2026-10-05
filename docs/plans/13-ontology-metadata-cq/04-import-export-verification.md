# 04 - Import, Export, Verification, and Rollout

Status: `open`

## Goal

Keep ontology JSON and module JSON round-trips useful after the metadata model expands, update feature documentation, and verify each implementation slice safely.

## Affected Files

- `/src/features/ontology/schemas/import.ts`
- `/src/features/ontology/schemas/module-transfer.ts`
- `/src/features/ontology/server/actions/ontology-transfer.ts`
- `/src/features/ontology/server/actions/modules.ts`
- `/src/features/ontology/server/owl-export/`
- `/src/features/ontology/README.md`
- `/src/features/documents/README.md`
- `/supabase/seed.sql`
- `/docs/plans/13-ontology-metadata-cq/`

## Slices

### Slice 1 - Ontology JSON schema extension `done`

- Extend `/src/features/ontology/schemas/import.ts` to include optional metadata blocks.
- Keep backward compatibility with current JSON files.
- Add optional fields for:
  - ontology default language
  - module descriptions
  - languages
  - CQs and CQ module links
  - localized texts
  - notes
  - examples
  - allowed instances
  - relation required flag
  - relation attributes

### Slice 2 - Module JSON schema extension `done`

- Extend `/src/features/ontology/schemas/module-transfer.ts`.
- Include module description.
- Include module-scoped classes, relations, relation attributes, localized texts, notes, examples, and allowed instances where the target belongs to the module payload.
- For CQs, export CQs linked to the module but preserve multi-module information carefully:
  - either include only current module link with a warning
  - or include all linked module names as external references
- Document the chosen behavior in the plan or implementation PR.

### Slice 3 - Import persistence and warnings `done`

- Update `/src/features/ontology/server/actions/ontology-transfer.ts`.
- Update `/src/features/ontology/server/actions/modules.ts`.
- Preserve current warning behavior for missing classes, parents, and relations.
- Add warnings for metadata targets that cannot be resolved during import.
- Keep import tolerant: unknown optional metadata should not break core class/relation import unless schema validation fails for core data.

### Slice 4 - Export payloads `done`

- Update ontology export to include metadata when selected.
- Decide whether metadata export is always included or behind an export checkbox.
- Preserve visual export behavior.
- Ensure relation attributes and CQs reference stable exported class/relation ids.

### Slice 5 - OWL export consideration `done`

- Review `/src/features/ontology/server/owl-export/`.
- Map notes/translations/examples to OWL annotations only if the implementation slice explicitly includes OWL metadata.
- Otherwise keep OWL export behavior unchanged and document metadata omission.

### Slice 6 - Seed data and fixtures `done`

- Update `/supabase/seed.sql` with a small representative sample:
  - one module description
  - one ontology-wide CQ
  - one multi-module CQ
  - one relation attribute
  - one class allowed instance
  - one translation row
  - one note
- Avoid overfitting seed data to a single UI path.

### Slice 7 - Documentation updates `done`

- Update `/src/features/ontology/README.md` when the ontology feature scope and flow change.
- Update `/src/features/documents/README.md` when relation attributes and CQ graph filtering are added to document review.
- Mark slices `done` as implementation lands.

### Slice 8 - Verification `open`

- Run `pnpm lint` or `npm exec pnpm -- lint`.
- Run `pnpm typecheck` or `npm exec pnpm -- typecheck` for schema/type changes.
- Run `pnpm build` or `npm exec pnpm -- build` when migrations, server actions, or route composition change.
- Manually verify:
  - ontology details dialog opens and saves metadata
  - module overview opens from module menu
  - CQ table supports ontology-wide and multi-module CQs
  - class allowed instances are suggestions
  - relation attributes can be defined
  - fact review shows relation attribute values
  - CQ graph filter respects status filters

Verification notes:

- `npm exec pnpm -- lint` passed.
- `npm exec pnpm -- build` passed after rerunning outside the sandbox so Next.js could fetch Google Fonts.
- `npm exec pnpm -- typecheck` is currently blocked by a pre-existing unrelated error in `/src/features/documents/components/shared/document-filters-toolbar/utils/option-data.ts` where `entitiesById` is referenced but only `entityById` is declared.
- Manual verification is still pending.

## Open Questions

- Should metadata export be included by default, or hidden behind an `Include metadata` option?
- Should module export include multi-module CQs at all, or only ontology export?
- Should OWL export include annotations in the same implementation phase or remain a later enhancement?
