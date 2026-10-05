# 02-02 - Module, Class, and Relation Metadata UI

Status: `done`

## Goal

Implement slices 4-7 from [`02 - Ontology Authoring UI`](./02-ontology-authoring-ui.md): module details, reusable ontology metadata editors, class detail metadata extensions, and relation detail metadata extensions.

This sub-plan starts from the completed ontology details and CQ work in [`02-01 - Ontology Details and CQ UI`](./02-01-ontology-details-and-cq-ui.md).

## Scope

- Add module details as a selectable detail-panel target.
- Add module overview entry points from module tab action menus and visual module groups.
- Add feature-local shared editors for localized texts, notes, and examples.
- Fetch metadata up-front for the active ontology page and pass it through the ontology shell.
- Extend class details with translations, notes, examples, allowed instances, and instance policy.
- Extend class attribute rows with an attribute metadata sheet/dialog.
- Extend relation details with translations, notes, examples, required toggle, and relation attributes.
- Extend relation attribute rows with the same metadata sheet/dialog pattern.

## Out of Scope

- Display-language switching for the main UI.
- Strict validation of controlled instances in document review.
- Document fact review changes for relation attribute values.
- CQ graph filtering in documents.
- Metadata versioning or audit history.
- Copying UI structure from `../kg-ui`; it can be used only as behavior reference.

## Agreed UX Decisions

- Switching module tabs remains a filter/navigation action and does not automatically replace the current detail selection.
- Module details open explicitly through `Overview` in the module tab action menu.
- In all-modules visual mode, selecting a module group may also open module details.
- Module details should live in the existing right detail panel, not a separate dialog.
- The visual-mode detail panel should become wider than the current `w-96` so module CQ summaries remain readable.
- Module CQ summary should stay compact rather than becoming a wide CQ table.
- `Add CQ` from module details opens ontology details with the CQ editor sheet already open and the current module preselected.
- `Manage all CQs` from module details opens ontology details on the CQ tab.
- Attribute-level metadata opens in a sheet/dialog from the attribute row instead of widening the attribute table.
- Metadata should be fetched up-front for the active ontology, then filtered in client components.
- Translations remain editor-only; canonical `name` and `description` columns remain normal UI labels.

## Data Loading Strategy

The ontology route should load the active ontology and all metadata needed by detail surfaces in one server render:

- ontology languages
- ontology CQs
- localized texts for all targets in the ontology
- notes for all targets in the ontology
- examples for all example-supported targets in the ontology
- allowed instances for all classes in the ontology
- relation attributes for all relations in the ontology

Suggested query additions:

- `/src/features/ontology/server/queries/metadata.ts`
  - Add ontology-wide query helpers by `ontology_id`, for example:
    - `getOntologyNotesByOntology(ontologyId)`
    - `getOntologyLocalizedTextsByOntology(ontologyId)`
    - `getOntologyExamplesByOntology(ontologyId)`
  - Keep target-specific helpers for smaller future surfaces.
- `/src/features/ontology/server/queries/allowed-instances.ts`
  - Add or reuse an ontology-wide helper keyed by class id.
- `/src/features/ontology/server/queries/relation-attributes.ts`
  - Reuse `getRelationAttributesByOntology`.
- `/src/features/ontology/server/queries/types.ts`
  - Add metadata bundle types only if it reduces prop noise across multiple components.

Use server actions already present for create/update/delete where possible. Extend actions only when the existing action omits a needed field:

- `/src/features/ontology/server/actions/classes.ts`
  - Add `instancePolicy` support to `updateClass`.
- `/src/features/ontology/server/actions/relations.ts`
  - Add `required` support to `updateRelation`.

## Component Plan

### `/src/app/ontology/page.tsx`

- Load all metadata up-front for the active ontology.
- Pass metadata collections to `/src/features/ontology/components/ontology-shell/ontology-shell.tsx`.
- Keep route composition server-side and avoid client-side fetching for initial detail data.

### `/src/features/ontology/components/ontology-shell/ontology-shell.tsx`

- Add detail selection state for modules alongside classes and relations.
- Suggested selection state:
  - `selectedDetail = { kind: "class" | "relation" | "module"; id: string } | null`
- Ensure selecting a class/relation clears module detail selection.
- Add `handleSelectModuleOverview(moduleId)` and pass it to:
  - `/src/features/ontology/components/module-tab-bar.tsx`
  - `/src/features/ontology/components/ontology-shell/visual-region.tsx`
- Keep module tab switching independent from module detail selection.
- Pass metadata props into class, relation, and module detail components.
- Pass an ontology-details opening controller to module details so module CQ actions can open the existing ontology details dialog flow.

### `/src/features/ontology/components/ontology-shell/detail-panel-shell.tsx`

- Allow a wider detail panel in visual mode.
- Suggested visual width: `w-[28rem]` or `w-[32rem]`.
- Keep browser-mode detail width flexible as it is now.
- Keep the collapsible behavior only for visual mode.

### `/src/features/ontology/components/module-tab-bar.tsx`

- Add `onModuleOverview: (moduleId: string) => void`.
- Pass the callback to `/src/features/ontology/components/module-actions/module-actions-menu.tsx`.
- Do not call `onModuleOverview` when a user only switches tabs.

### `/src/features/ontology/components/module-actions/module-actions-menu.tsx`

- Add an `Overview` menu item above rename/duplicate/export.
- Suggested icon: `PanelRightOpen`, `Info`, or `FileText`.
- Keep rename, duplicate, export, and delete behavior unchanged.

### `/src/features/ontology/components/module-detail/module-detail.tsx`

Create a new multi-file component folder.

Primary responsibilities:

- Edit module name and description.
- Show translations for module name and description through `LocalizedTextEditor`.
- Show notes through `NotesEditor`.
- Show a compact CQ summary filtered to the module.
- Provide `Add CQ` action with current module preselected.
- Provide `Manage all CQs` action opening ontology details on the CQ tab.

Suggested subcomponents:

- `/src/features/ontology/components/module-detail/module-detail.tsx`
- `/src/features/ontology/components/module-detail/module-overview-section.tsx`
- `/src/features/ontology/components/module-detail/module-cq-summary.tsx`

CQ summary display:

- Show count and a compact list of related CQs.
- Each row should show question text and a small SPO summary when available.
- Avoid a full CQ management table in the side panel.
- If there are no CQs linked to the module, show a small empty state with `Add CQ`.

### `/src/features/ontology/components/shared/localized-text-editor/localized-text-editor.tsx`

Create a feature-local shared editor.

Props should support:

- ontology id
- target `{ type, id }`
- available languages
- existing localized text rows
- editable fields, usually `name` and `description`
- optional default language code

Behavior:

- Show canonical/default-language value as context, not as editable localized text.
- Show one row per language/field pair that should be editable.
- Use explicit save/delete actions.
- Use `upsertLocalizedText` and `deleteLocalizedText`.
- Keep empty rows compact.

Suggested files:

- `/src/features/ontology/components/shared/localized-text-editor/localized-text-editor.tsx`
- `/src/features/ontology/components/shared/localized-text-editor/localized-text-row.tsx`
- `/src/features/ontology/components/shared/localized-text-editor/types.ts`

### `/src/features/ontology/components/shared/notes-editor/notes-editor.tsx`

Create a feature-local shared note editor.

Props should support:

- ontology id
- target `{ type, id }`
- existing note rows

Behavior:

- Add note.
- Edit note inline.
- Delete note.
- Keep ordering by `sort_order`; drag reordering is not needed in this slice.
- Use `createNote`, `updateNote`, and `deleteNote`.

Suggested files:

- `/src/features/ontology/components/shared/notes-editor/notes-editor.tsx`
- `/src/features/ontology/components/shared/notes-editor/note-row.tsx`
- `/src/features/ontology/components/shared/notes-editor/types.ts`

### `/src/features/ontology/components/shared/examples-editor/examples-editor.tsx`

Create a feature-local shared examples editor.

Props should support:

- ontology id
- target `{ type, id }`
- existing example rows
- mode: `value` or `triple`

Behavior:

- For class and attribute examples, use a single `value` field.
- For relation examples, support optional subject, predicate, and object labels plus a compact value/summary field.
- For CQ examples, keep support available through the generic target type but do not add new CQ UI unless needed by existing screens.
- Add, edit, and delete examples through existing example actions.

Suggested files:

- `/src/features/ontology/components/shared/examples-editor/examples-editor.tsx`
- `/src/features/ontology/components/shared/examples-editor/example-row.tsx`
- `/src/features/ontology/components/shared/examples-editor/types.ts`

### `/src/features/ontology/components/class-detail/class-detail.tsx`

Extend the current detail layout while keeping sections small:

- Identity: existing header section for name, description, module, parent class.
- Localization: `LocalizedTextEditor` for class `name` and `description`.
- Instances: `instance_policy` and allowed instances.
- Examples: `ExamplesEditor` in value mode.
- Attributes: existing attribute table with metadata action per row.
- Notes: `NotesEditor`.
- Relations: existing related relations section.
- Danger zone: existing delete action.

Avoid nesting cards. Prefer section headings, separators, compact bordered rows, and existing shadcn primitives.

### `/src/features/ontology/components/class-detail/allowed-instances/allowed-instances.tsx`

Create a class-detail subcomponent for instance control.

Behavior:

- Select `instance_policy`.
- Start with known policies:
  - `open`
  - `controlled`
- Explain policy only in labels/tooltips when needed, not as large instructional text.
- Manage allowed instance rows with add/edit/delete.
- Use existing allowed instance server actions.
- `controlled` is advisory for now; it does not block review or ontology editing.

Suggested files:

- `/src/features/ontology/components/class-detail/allowed-instances/allowed-instances.tsx`
- `/src/features/ontology/components/class-detail/allowed-instances/allowed-instance-row.tsx`
- `/src/features/ontology/components/class-detail/allowed-instances/instance-policy-control.tsx`

### `/src/features/ontology/components/class-detail/attribute-table/attribute-table.tsx`

- Keep existing table columns compact.
- Add a metadata action column or reuse the existing actions cell.
- Open an attribute metadata sheet/dialog for one selected attribute.
- Pass available languages and filtered attribute metadata into the sheet/dialog.

### `/src/features/ontology/components/shared/attribute-metadata-dialog/attribute-metadata-dialog.tsx`

Create one reusable feature-local metadata surface for both class attributes and relation attributes.

Target support:

- `{ type: "attribute"; id: string }`
- `{ type: "relation_attribute"; id: string }`

Content:

- Attribute name/description context.
- `LocalizedTextEditor` for `name` and `description`.
- `ExamplesEditor` in value mode.
- `NotesEditor`.

Suggested files:

- `/src/features/ontology/components/shared/attribute-metadata-dialog/attribute-metadata-dialog.tsx`
- `/src/features/ontology/components/shared/attribute-metadata-dialog/types.ts`

Dialog vs sheet:

- Prefer a right-side `Sheet` if it feels consistent with CQ editing.
- Use a `Dialog` only if the implementation needs more horizontal room.
- In either case, launch from an icon-only row action with tooltip/aria label.

### `/src/features/ontology/components/relation-detail.tsx`

The file is currently a single component. If it becomes long, split into a folder:

- `/src/features/ontology/components/relation-detail/relation-detail.tsx`
- `/src/features/ontology/components/relation-detail/relation-overview-section.tsx`
- `/src/features/ontology/components/relation-detail/relation-shape-section.tsx`
- `/src/features/ontology/components/relation-detail/relation-attributes/relation-attributes.tsx`

Extend relation detail sections:

- Identity: name, inverse name, description.
- Localization: `LocalizedTextEditor` for relation `name` and `description`.
- Relation shape: domain class, range class, cardinality, required toggle.
- Relation attributes: table with add/edit/delete.
- Examples: `ExamplesEditor` in triple mode.
- Notes: `NotesEditor`.
- Danger zone: existing delete action.

### `/src/features/ontology/components/relation-detail/relation-attributes/relation-attributes.tsx`

Create a relation-attributes table.

Fields:

- name
- data type
- required
- description
- metadata action
- delete action

Behavior:

- Add relation attribute inline, following the class attribute table pattern.
- Edit existing relation attributes inline.
- Delete relation attributes.
- Open `AttributeMetadataDialog` for translations, notes, and examples.

Suggested files:

- `/src/features/ontology/components/relation-detail/relation-attributes/relation-attributes.tsx`
- `/src/features/ontology/components/relation-detail/relation-attributes/relation-attribute-row.tsx`
- `/src/features/ontology/components/relation-detail/relation-attributes/add-relation-attribute-row.tsx`

### `/src/features/ontology/components/ontology-details-dialog/ontology-details-dialog.tsx`

Expose enough state control for module detail CQ actions:

- Open on a requested tab, especially `competency-questions`.
- Optionally open the CQ editor sheet immediately.
- Accept optional `preselectedModuleId` for CQ creation.

If this creates too much prop/state complexity in the header, introduce a small controller state in `/src/features/ontology/components/ontology-shell/ontology-shell.tsx` and pass it into `/src/features/ontology/components/ontology-header/ontology-header.tsx`.

## Implementation Slices

### Slice 4 - Module Detail Panel `done`

- Add module detail selection state in `/src/features/ontology/components/ontology-shell/ontology-shell.tsx`.
- Widen the visual detail panel in `/src/features/ontology/components/ontology-shell/detail-panel-shell.tsx`.
- Add `Overview` to `/src/features/ontology/components/module-actions/module-actions-menu.tsx`.
- Add `onModuleOverview` wiring through `/src/features/ontology/components/module-tab-bar.tsx`.
- Add `/src/features/ontology/components/module-detail/module-detail.tsx`.
- Show module name, description, translations, notes, and compact CQ summary.
- Wire `Add CQ` and `Manage all CQs` into the ontology details dialog flow.
- Add visual module group selection only if the existing visual-region/module-group API can support it cleanly in this slice; otherwise leave a TODO in the plan and keep the menu path working.

### Slice 5 - Shared Metadata Editors `done`

- Add `LocalizedTextEditor`.
- Add `NotesEditor`.
- Add `ExamplesEditor`.
- Add `AttributeMetadataDialog` shared by class attributes and relation attributes.
- Add ontology-wide metadata query helpers and pass metadata from `/src/app/ontology/page.tsx` through the shell.
- Replace the ontology-specific localized-name editor from Slice 2 only if it is small and low-risk; otherwise leave it for a later cleanup.

### Slice 6 - Class Detail Extensions `done`

- Extend `updateClass` with `instancePolicy`.
- Add allowed instances section with policy selector and instance rows.
- Add class translations, examples, and notes.
- Add attribute metadata action to the attribute table.
- Wire attribute metadata sheet/dialog for class attributes.
- Keep the class detail readable by extracting sections once the component grows.

### Slice 7 - Relation Detail Extensions `done`

- Extend `updateRelation` with `required`.
- Split relation detail into a folder if needed before adding several sections.
- Add required toggle near cardinality.
- Add relation translations, examples, and notes.
- Add relation attributes table.
- Wire relation attribute metadata sheet/dialog.

## Suggested UI Components

- `Button`, `Input`, `Textarea`, `Select`, `Switch` or `Checkbox`, `Table`, `Badge`, `Separator`, `Sheet`, `Dialog`, and `Tooltip` from existing shadcn/ui components.
- Existing `/src/features/ontology/components/shared/editable-field.tsx`.
- Existing `/src/features/ontology/components/shared/empty-state.tsx`.
- Existing `/src/components/shared/class-picker`.

Do not add a second styling approach. Use existing spacing, border, typography, and section patterns from ontology detail surfaces.

## Verification

- Run `pnpm lint` or `npm exec pnpm -- lint`.
- Run `pnpm typecheck` or `npm exec pnpm -- typecheck`.
- For larger integration changes, run `pnpm build` or `npm exec pnpm -- build`.
- Manually verify:
  - module tab switch does not open module details
  - module `Overview` opens module details
  - visual detail panel is wide enough for module CQ summary
  - module `Add CQ` opens the CQ editor with the current module selected
  - module `Manage all CQs` opens ontology details on the CQ tab
  - localized text editor saves and deletes translations for module, class, relation, and attributes
  - notes editor adds, edits, and deletes notes for module, class, relation, and attributes
  - examples editor handles class/attribute values and relation triples
  - class instance policy persists
  - allowed instances add/edit/delete and appear in CQ instance selectors after refresh
  - relation required toggle persists
  - relation attributes add/edit/delete and expose metadata

## Resolved Questions

- Module details open only through explicit overview actions, not automatic tab changes.
- Module details use the existing detail panel.
- Attribute metadata opens in a sheet/dialog from row actions.
- Metadata is fetched up-front for the active ontology.
- Module detail `Add CQ` opens the ontology details CQ editor with the module preselected.

## Remaining Open Questions

- No remaining implementation-blocking questions for this sub-plan.
