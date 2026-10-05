# 02 - Ontology Authoring UI

Status: `open`

## Goal

Give users clear ontology-level and module-level editing surfaces for metadata, CQs, translations, notes, examples, allowed instances, required relations, and relation attributes.

Detailed plan for slices 1-3: [`02-01 - Ontology Details and CQ UI`](./02-01-ontology-details-and-cq-ui.md).

## Affected Files

- `/src/features/ontology/README.md`
- `/src/features/ontology/components/ontology-header/ontology-header.tsx`
- `/src/features/ontology/components/ontology-shell/ontology-shell.tsx`
- `/src/features/ontology/components/ontology-shell/detail-panel-shell.tsx`
- `/src/features/ontology/components/module-tab-bar.tsx`
- `/src/features/ontology/components/class-detail/class-detail.tsx`
- `/src/features/ontology/components/class-detail/class-detail-header.tsx`
- `/src/features/ontology/components/class-detail/attribute-table/attribute-table.tsx`
- `/src/features/ontology/components/relation-detail.tsx`
- `/src/features/ontology/server/actions/`
- `/src/features/ontology/server/queries/`

## UX Decisions

- The ontology details dialog is the primary place for ontology-wide metadata and full CQ management.
- The ontology details trigger is an icon-only header button with a tooltip.
- The ontology details dialog is near-fullscreen and uses top tabs.
- CQ create/edit opens in a right-side sheet from the ontology details dialog.
- The module details panel is contextual and reuses the existing right-side detail panel pattern.
- Module details should be reachable from the module tab action menu via `Overview`.
- In all-modules visual mode, selecting a module group may also open module details.
- Class, relation, and attribute metadata should live in their existing detail surfaces where possible.
- Translation editing is editor-only; normal UI labels continue using canonical columns for now.

## Slices

### Slice 1 - Ontology details dialog shell `done`

- Add an `Ontology details` trigger in `/src/features/ontology/components/ontology-header/ontology-header.tsx`.
- Create `/src/features/ontology/components/ontology-details-dialog/ontology-details-dialog.tsx`.
- Include tabs or segmented sections:
  - Overview
  - Languages
  - Competency Questions
  - Notes
- Keep the dialog focused on ontology-level data and cross-module CQ management.

### Slice 2 - Ontology overview and language editing `done`

- Let users edit ontology name, use case, and default language.
- Let users manage available language codes and labels.
- Avoid adding a display-language switch in this slice.
- Add small editor-only localized text management for ontology name. Keep the reusable localized text editor for Slice 5.

### Slice 3 - CQ management UI `done`

- Add `/src/features/ontology/components/ontology-details-dialog/competency-questions-tab.tsx`.
- Show a CQ table with:
  - question
  - related modules
  - subject class
  - predicate relation
  - object class
  - optional subject/object instance
- Show `Ontology-wide` when a CQ has zero module links.
- Add `/src/features/ontology/components/ontology-details-dialog/cq-editor-sheet.tsx`.
- Use module multi-select for CQ-to-module links.
- Auto-select SPO-related modules while still allowing manual module edits.
- Use class-first SPO selectors.
- Auto-fill empty subject/object classes from selected relation domain/range.
- Show optional instance selectors only after a subject or object class is selected.

### Slice 4 - Module detail panel `done`

- Add a module selection path in `/src/features/ontology/components/ontology-shell/ontology-shell.tsx`. When making a more detailed plan discuss with the user what's meant with this. Discuss with him if it may be better to display the module details in a dialog instead of inside the detail panel.
- Update `/src/features/ontology/components/ontology-shell/detail-panel-shell.tsx` to host module details.
- Add `/src/features/ontology/components/module-detail/module-detail.tsx`.
- Show:
  - module name
  - module description
  - translations for module name and description
  - notes
  - CQ summary filtered to the module
  - add CQ action preselecting the current module
  - manage all CQs action opening ontology details
- Add `Overview` to the module tab menu in `/src/features/ontology/components/module-tab-bar.tsx`.

### Slice 5 - Shared metadata editors `done`

- Add `/src/features/ontology/components/shared/localized-text-editor/localized-text-editor.tsx`.
- Add `/src/features/ontology/components/shared/notes-editor/notes-editor.tsx`.
- Add `/src/features/ontology/components/shared/examples-editor/examples-editor.tsx`.
- Keep these components generic but scoped to the ontology feature until another feature reuses them.
- Support target type, target id, field name, language, and value.

### Slice 6 - Class detail extensions `done`

- Extend `/src/features/ontology/components/class-detail/class-detail.tsx`.
- Add allowed instances section:
  - class `instance_policy`
  - allowed instance rows
  - example/suggestion behavior
- Add examples for class instances.
- Add notes and translations for class name and description.
- Extend class attribute table or row editing to expose:
  - examples
  - notes
  - translations for attribute name and description

### Slice 7 - Relation detail extensions `done`

- Extend `/src/features/ontology/components/relation-detail.tsx`.
- Add relation `required` toggle near cardinality.
- Add relation attributes table.
- Add examples for relation triples.
- Add notes and translations for relation name and description.
- Add metadata support for relation attributes:
  - examples
  - notes
  - translations for name and description

## Open Questions

- Should module details open automatically when selecting a module tab, or only when the user chooses `Overview`?
- Should attribute-level metadata be inline in the existing table, or open in an attribute detail dialog to avoid a very wide table? As it's currently done for classes, table may be reused for this.
