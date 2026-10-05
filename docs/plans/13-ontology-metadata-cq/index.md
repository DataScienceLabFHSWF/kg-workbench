# 13 - Ontology Metadata, Competency Questions, and Relation Attributes

## Overview

Extend the ontology model and authoring UI with richer metadata for ontology documents, modules, classes, relations, class attributes, and relation attributes. The main product goal is to let users document why ontology modules exist, capture competency questions (CQs), translate labels/descriptions in an editor-only workflow, define examples and allowed instances, and later use CQs as one-click graph filters in the documents fact graph.

This plan is intentionally split into implementation slices because it touches database schema, ontology editing UI, import/export, document fact review, and graph filtering.

## Agreed decisions

- CQs can be related to zero, one, or many modules.
- A CQ with zero modules is treated as `Ontology-wide`.
- CQs should primarily select subject class, predicate relation, and object class.
- CQ filtering in documents should respect the current fact status filters.
- CQs may later narrow subject/object to allowed instances after classes are selected.
- Allowed class instances start as suggestions/examples, not strict validation constraints.
- Classes may later choose an `instance_policy` such as `open` or `controlled`.
- `controlled` should warn about unknown instances first; blocking validation can be a later mode.
- No ontology-wide display-language switch is needed for now.
- Translations are editor-only in the first implementation.
- Translations should cover existing names/descriptions, including ontology name, module name/description, class name/description, relation name/description, attribute name/description, examples, and relation attributes.
- Existing canonical `name` and `description` columns remain the default-language display source.
- Ontology default language should be stored as ontology metadata, but changing it should not automatically rewrite canonical columns in the first implementation.
- Notes are annotations, not translations.
- Relation attributes mean fact/edge attributes for a relation instance, and they also support notes, translations, and examples.
- Relation attributes should appear in the document fact review UI for facts mapped to that relation.
- Required relation attributes should be visibly missing until filled.

## Main UX Shape

- Add an ontology details dialog opened from the ontology header.
- Add a module details panel as a selectable detail type in the existing ontology right panel.
- Keep the ontology details dialog as the source of truth for full CQ management.
- Show module-related CQ summaries in the module detail panel, with entry points to add or manage CQs filtered to that module.
- Extend class and relation detail panels with metadata sections instead of hiding metadata in creation dialogs.
- Extend document fact review and fact graph with relation attribute editing and CQ filtering.

## Relevant Entry Points

- `/src/app/ontology/page.tsx` - ontology route composition.
- `/src/app/documents/page.tsx` - documents route composition.
- `/src/features/ontology/README.md` - ontology feature context.
- `/src/features/documents/README.md` - documents feature context.
- `/src/features/ontology/components/ontology-shell/ontology-shell.tsx` - ontology workspace state and selected detail routing.
- `/src/features/ontology/components/ontology-shell/detail-panel-shell.tsx` - class/relation/module detail host.
- `/src/features/ontology/components/ontology-header/ontology-header.tsx` - ontology details dialog trigger.
- `/src/features/ontology/components/module-tab-bar.tsx` - module action menu and module overview entry point.
- `/src/features/ontology/components/class-detail/class-detail.tsx` - class metadata, allowed instances, examples, notes, translations.
- `/src/features/ontology/components/relation-detail.tsx` - relation metadata, required toggle, relation attributes, examples, notes, translations.
- `/src/features/ontology/components/class-detail/attribute-table/attribute-table.tsx` - class attribute metadata extension.
- `/src/features/ontology/server/queries/` - ontology read layer.
- `/src/features/ontology/server/actions/` - ontology write actions.
- `/src/features/ontology/schemas/import.ts` - ontology JSON import/export schema.
- `/src/features/ontology/schemas/module-transfer.ts` - module JSON import/export schema.
- `/src/features/documents/components/fact-card/fact-card.tsx` - fact-level review UI.
- `/src/features/documents/components/fact-inspector/facts-tab/` - fact list/review surfaces.
- `/src/features/documents/server/queries/` - document ontology/fact read layer.
- `/src/features/documents/server/actions/` - fact and relation attribute value writes.
- `/src/features/documents/utils/document-filters.ts` - shared document filtering.
- `/src/features/documents/flow/use-fact-graph.ts` - fact graph data mapping.
- `/src/features/documents/components/fact-graph-view.tsx` - graph mode CQ filter wiring.
- `/drizzle/baseline/` - database schema migrations.
- `/src/domain/database.types.ts` - generated Supabase types; do not edit manually.
- `/src/domain/ontology.ts` and `/src/domain/documents.ts` - domain table aliases.

## Sub-Plans

- [01 - Data Model](./01-data-model.md) `done`
- [02 - Ontology Authoring UI](./02-ontology-authoring-ui.md) `open`
  - [02-01 - Ontology Details and CQ UI](./02-01-ontology-details-and-cq-ui.md) `open`
  - [02-02 - Module, Class, and Relation Metadata UI](./02-02-module-class-relation-metadata-ui.md) `done`
- [03 - Documents Fact Review and CQ Graph Filtering](./03-documents-fact-review-and-cq-filtering.md) `done`
- [04 - Import, Export, Verification, and Rollout](./04-import-export-verification.md) `open`

## New or Changed Components

- `/src/features/ontology/components/ontology-details-dialog/ontology-details-dialog.tsx`
  - `overview-tab.tsx`
  - `languages-tab.tsx`
  - `competency-questions-tab.tsx`
  - `notes-tab.tsx`
  - `cq-editor-sheet.tsx`
  - `cq-pattern-fields.tsx`
  - `language-list-editor.tsx`

- `/src/features/ontology/components/module-detail/module-detail.tsx`
  - `module-overview-section.tsx`
  - `module-cq-summary.tsx`

- `/src/features/ontology/components/shared/localized-text-editor/localized-text-editor.tsx`
  - `localized-text-row.tsx`
  - `types.ts`

- `/src/features/ontology/components/shared/notes-editor/notes-editor.tsx`
  - `note-row.tsx`
  - `types.ts`

- `/src/features/ontology/components/shared/examples-editor/examples-editor.tsx`
  - `class-example-row.tsx`
  - `attribute-example-row.tsx`
  - `relation-example-row.tsx`
  - `types.ts`

- `/src/features/ontology/components/class-detail/allowed-instances/allowed-instances.tsx`
  - `allowed-instance-row.tsx`
  - `instance-policy-control.tsx`

- `/src/features/ontology/components/relation-detail/relation-attributes/relation-attributes.tsx`
  - `relation-attribute-row.tsx`
  - `add-relation-attribute-row.tsx`

- `/src/features/documents/components/fact-card/relation-attribute-values/relation-attribute-values.tsx`
  - `relation-attribute-value-row.tsx`
  - `missing-required-relation-attribute.tsx`

- `/src/features/documents/components/shared/cq-filter-control/cq-filter-control.tsx`
  - `cq-filter-option.tsx`
  - `types.ts`

## Open Questions

- Should a `controlled` class produce only warnings in fact review, or should a later strict mode block accepting facts with unknown instances?
- Should relation attribute values be required before accepting a fact, or only flagged as incomplete in the first implementation?
- Should CQ graph filtering match exact relation type only, or allow inverse relation matching when `inverse_name` is set?
- Should examples be versioned or audited later when ontology versioning is introduced?
