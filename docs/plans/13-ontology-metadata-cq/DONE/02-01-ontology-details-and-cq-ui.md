# 02-01 - Ontology Details and CQ UI

Status: `done`

## Goal

Implement the first ontology authoring UI increment: a near-fullscreen ontology details dialog for ontology-level metadata, editor languages, ontology-localized names, ontology notes shell, and full competency question management.

This sub-plan covers slices 1-3 from [`02-ontology-authoring-ui.md`](./02-ontology-authoring-ui.md).

## Scope

- Add an icon-only `Ontology details` trigger to `/src/features/ontology/components/ontology-header/ontology-header.tsx`.
- Add `/src/features/ontology/components/ontology-details-dialog/ontology-details-dialog.tsx`.
- Add tabs for:
  - Overview
  - Languages
  - Competency Questions
  - Notes
- Let users edit ontology name, use case, and default language.
- Let users manage available editor languages.
- Let users manage ontology-name localized text rows in a small ontology-only section.
- Let users create, edit, delete, and module-link CQs.
- Use class-first SPO selectors, with optional existing-instance selectors after subject/object class selection.
- Do not add a display-language switch.

## Out of Scope

- Module detail panel work from Slice 4.
- Generic localized text, notes, and examples editors from Slice 5, except for a small ontology-name localized text section that should later be replaced or adapted to the shared editor.
- Class, relation, and attribute metadata extensions from later slices.
- Inline creation of allowed instances from the CQ editor.
- Document answerability checks.
- Document CQ graph filtering.

## Agreed UX Decisions

- The ontology details trigger is an icon-only button with a tooltip.
- The dialog is near-fullscreen and uses top `Tabs`.
- Overview and language changes use explicit save actions rather than blur autosave.
- CQ create/edit uses a right-side `Sheet`, not a nested dialog.
- Available language codes are set on creation and immutable afterward; labels remain editable.
- Changing default language must keep language data consistent by selecting from available languages or auto-adding the selected language.
- A small ontology-name localization section belongs in this first UI, but the reusable localized text editor belongs in Slice 5.
- CQs use a dense table with search/filter and compact badges.
- Predicate relation selection should auto-fill subject/object classes from the relation domain/range when empty.
- If existing subject/object selections conflict with the chosen relation, show a warning and offer to replace them.
- Subject/object instance selectors only show after the corresponding class is selected.
- Instance selectors use existing allowed instances only.
- CQ module links are auto-selected from SPO-related modules, while still allowing manual edits.
- A CQ with zero module links is displayed as `Ontology-wide`.

## Data and Server Requirements

- `/drizzle/baseline/20260423000000_ontology-metadata.sql`
  - `ontology_documents.default_language` already exists.
  - `ontology_documents.usecase` is needed for the Overview tab.
- `/src/domain/database.types.ts`
  - Regenerate after applying the migration so `ontology_documents.usecase` is typed.
- `/src/domain/ontology.ts`
  - Should pick up `usecase` through generated table aliases.
- `/src/features/ontology/server/queries.ts`
  - Existing document query should include `usecase` automatically through `select("*")` after type regeneration.
  - Existing language and CQ queries can be reused.
  - Add or reuse a query path for ontology-localized text for target `{ type: "ontology", id }`.
  - CQ table needs enough display data to resolve class, relation, instance, and module names from props already loaded by the shell.
- `/src/features/ontology/server/actions/ontology-documents.ts`
  - Add an update action for ontology overview fields: `name`, `usecase`, `default_language`.
- `/src/features/ontology/server/actions/languages.ts`
  - Existing create/update/delete actions can be reused.
  - Add guard behavior in UI or server action so deleting the current default language is blocked or requires choosing a replacement.
- `/src/features/ontology/server/actions/localized-texts.ts`
  - Reuse for ontology-name localized text rows.
- `/src/features/ontology/server/actions/competency-questions.ts`
  - Existing create/update/delete and `setCQModules` actions can be reused.
  - UI should call CQ create/update and module-link save as one form submission flow.

## Component Plan

### `/src/features/ontology/components/ontology-header/ontology-header.tsx`

- Add local `detailsOpen` state.
- Render an icon-only `Button` near the document selector or document actions.
- Use `Tooltip`, `TooltipTrigger`, and `TooltipContent` with label `Ontology details`.
- Suggested icon: `Info`, `Settings2`, or `FilePenLine` from `lucide-react`.
- Disable the trigger when no ontology document is selected.
- Mount `OntologyDetailsDialog` when `currentDocument` exists.
- Pass:
  - `ontology={currentDocument}`
  - `modules={currentDocument.modules}`
  - `classes={classes}`
  - `relations={relations}`
  - loaded languages/CQs/localized texts if the route query layer is expanded, otherwise let the dialog receive them from a client-side prop added at the page/shell boundary.

### `/src/features/ontology/components/ontology-details-dialog/ontology-details-dialog.tsx`

- Client component.
- Use shadcn `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription`, and `Tabs`.
- Near-fullscreen sizing should follow the export dialog pattern:
  - `h-[calc(100vh-2rem)]`
  - `w-[calc(100vw-2rem)]`
  - `max-w-none`
  - internal `overflow-hidden`
- Top tabs:
  - `Overview`
  - `Languages`
  - `Competency Questions`
  - `Notes`
- Keep tab content scrollable inside the dialog.
- Avoid nested cards. Use section headers, separators, table surfaces, and compact bordered rows where needed.

### `/src/features/ontology/components/ontology-details-dialog/overview-tab.tsx`

- Client component.
- Fields:
  - ontology name: `Input`
  - use case: `Textarea`
  - default language: `Select`
- Use explicit `Save overview` button.
- Disable save while pending.
- Show validation inline:
  - name required
  - default language required
  - use case optional
- Use `toast` for save errors/success where consistent with existing ontology actions.
- If default language is not in available languages, either auto-add it or expose a small inline resolution action. Prefer selecting from existing languages once language rows are loaded.

### `/src/features/ontology/components/ontology-details-dialog/languages-tab.tsx`

- Client component.
- Use `Table` or compact rows for language list:
  - code
  - label
  - default marker
  - actions
- Create language row:
  - `Input` for code
  - `Input` for label
  - `Button` with plus icon
- Language code behavior:
  - normalize to lowercase trimmed BCP-47-ish values such as `en`, `de`, `en-US`
  - immutable after create
  - unique per ontology
- Label behavior:
  - editable with explicit row save
  - default to code if omitted only if product copy feels acceptable; otherwise require a label
- Default language behavior:
  - set via Overview tab `Select`, or expose `Make default` row action that calls the same overview update action
  - block deleting the default language until another default exists
- Include a small `Localized ontology name` subsection:
  - one row per available non-default language
  - field name fixed to `name`
  - save/delete through `upsertLocalizedText` and `deleteLocalizedText`
  - clearly note in implementation comments or plan comments that this should migrate to `/src/features/ontology/components/shared/localized-text-editor/localized-text-editor.tsx` in Slice 5.

### `/src/features/ontology/components/ontology-details-dialog/competency-questions-tab.tsx`

- Client component.
- Use `Table`, `Badge`, `Button`, `Input`, `DropdownMenu`, and existing shared `SearchInput` if suitable.
- Header controls:
  - search by question text
  - module filter using `MultiSelectDropdown`
  - add CQ icon+text button
- Table columns:
  - question
  - related modules
  - subject class
  - predicate relation
  - object class
  - subject instance
  - object instance
  - actions
- Related modules cell:
  - show module badges when linked
  - show `Ontology-wide` badge/text when zero module links exist
- SPO cells:
  - show muted `Not set` text when missing
  - show compact labels resolved from loaded classes, relations, and allowed instances
- Actions:
  - edit opens `CQEditorSheet`
  - delete uses `AlertDialog`
- Empty states:
  - no CQs: focused empty state with `Add competency question`
  - no search/filter results: compact empty state with clear-filter action

### `/src/features/ontology/components/ontology-details-dialog/cq-editor-sheet.tsx`

- Client component using shadcn `Sheet`.
- Opens from the right side of the ontology details dialog.
- Fields:
  - question: `Textarea`
  - related modules: `MultiSelectDropdown`
  - subject class: `ClassPicker`
  - predicate relation: new relation picker or a `Select`/`Popover` matching existing style
  - object class: `ClassPicker`
  - subject instance: existing allowed-instance selector, visible only after subject class selection
  - object instance: existing allowed-instance selector, visible only after object class selection
- Save behavior:
  - explicit `Save CQ`
  - create/update CQ row first
  - then call `setCQModules`
  - close only after both succeed
- SPO relation behavior:
  - choosing a relation auto-fills empty subject/object classes from relation domain/range
  - if filled classes conflict with relation domain/range, show warning copy and a `Use relation classes` action
- Module auto-selection behavior:
  - derive module IDs from selected subject class, object class, and relation domain/range classes
  - auto-select those module IDs on SPO changes
  - preserve user-added module IDs
  - allow users to manually remove auto-selected module IDs
  - if the final selected module set is empty, save as ontology-wide
- Instance selector behavior:
  - only list existing allowed instances for the selected class
  - clear instance selection when its class changes
  - show muted unavailable state when the class has no allowed instances

### `/src/features/ontology/components/ontology-details-dialog/notes-tab.tsx`

- For this sub-plan, create a shell with an empty state or read-only placeholder if note data is not wired yet.
- Full notes editing should be implemented through `/src/features/ontology/components/shared/notes-editor/notes-editor.tsx` in Slice 5.

## Suggested Subcomponents

- `/src/features/ontology/components/ontology-details-dialog/ontology-details-dialog.tsx`
- `/src/features/ontology/components/ontology-details-dialog/overview-tab.tsx`
- `/src/features/ontology/components/ontology-details-dialog/languages-tab.tsx`
- `/src/features/ontology/components/ontology-details-dialog/language-row.tsx`
- `/src/features/ontology/components/ontology-details-dialog/localized-ontology-name-section.tsx`
- `/src/features/ontology/components/ontology-details-dialog/competency-questions-tab.tsx`
- `/src/features/ontology/components/ontology-details-dialog/cq-table-row.tsx`
- `/src/features/ontology/components/ontology-details-dialog/cq-editor-sheet.tsx`
- `/src/features/ontology/components/ontology-details-dialog/cq-pattern-fields.tsx`
- `/src/features/ontology/components/ontology-details-dialog/cq-module-link-field.tsx`
- `/src/features/ontology/components/ontology-details-dialog/allowed-instance-select.tsx`
- `/src/features/ontology/components/ontology-details-dialog/notes-tab.tsx`
- `/src/features/ontology/components/ontology-details-dialog/types.ts`

## shadcn and Existing Components

- Use `Button` for actions.
- Use `Tooltip` for the icon-only header trigger.
- Use `Dialog` for the ontology details shell.
- Use `Tabs` for top-level sections.
- Use `Sheet` for CQ create/edit.
- Use `Table` for CQs and language rows when density is useful.
- Use `Input`, `Textarea`, `Select`, and `Label` for forms.
- Use `Badge` for modules, default language, ontology-wide, and compact field states.
- Use `AlertDialog` for CQ deletion.
- Use existing `/src/components/shared/multi-select-dropdown.tsx` for module multi-select.
- Use existing `/src/components/shared/class-picker/class-picker.tsx` for class selection.
- Use existing `/src/features/ontology/components/shared/empty-state.tsx` and `search-input.tsx` where they fit.

## Implementation Slices

### Slice 1 - Dialog Shell and Entry Point `done`

- Add the icon-only details trigger with tooltip to `/src/features/ontology/components/ontology-header/ontology-header.tsx`.
- Create `/src/features/ontology/components/ontology-details-dialog/ontology-details-dialog.tsx`.
- Create stub tab components for Overview, Languages, Competency Questions, and Notes.
- Wire the dialog to the current ontology document and existing loaded ontology data.
- Ensure empty/no-document states are handled by disabling the trigger.

### Slice 2 - Overview and Languages `done`

- Add `ontology_documents.usecase` to `/drizzle/baseline/20260423000000_ontology-metadata.sql`.
- Regenerate Supabase types after migration changes.
- Add/update server action for ontology overview fields in `/src/features/ontology/server/actions/ontology-documents.ts`.
- Implement `overview-tab.tsx` with name, use case, and default language editing.
- Implement `languages-tab.tsx` with language create, label edit, delete, default-language safeguards, and ontology-name localized text rows.
- Keep reusable localized text editor work explicitly deferred to Slice 5.

### Slice 3 - CQ Management `done`

- Implement `/src/features/ontology/components/ontology-details-dialog/competency-questions-tab.tsx`.
- Implement `/src/features/ontology/components/ontology-details-dialog/cq-editor-sheet.tsx`.
- Add compact CQ table with search and module filtering.
- Add CQ create/edit/delete flows.
- Use module multi-select with auto-selected SPO-related modules.
- Use class-first SPO selectors with relation-domain/range autofill.
- Show optional existing-instance selectors only after subject/object class selection.
- Show `Ontology-wide` when no CQ module links are saved.

## Verification

- Run `pnpm lint` or `npm exec pnpm -- lint`.
- Run `pnpm typecheck` or `npm exec pnpm -- typecheck` after type regeneration and implementation.
- Manually verify:
  - details trigger is disabled with no ontology selected
  - dialog opens and tabs are reachable
  - overview save persists name, use case, and default language
  - default language cannot become inconsistent with available languages
  - language codes are immutable after creation
  - localized ontology name rows save/delete correctly
  - CQ table displays ontology-wide and module-linked CQs correctly
  - CQ sheet auto-fills classes from relation and auto-selects SPO-related modules
  - clearing all module links saves a CQ as ontology-wide

## Open Questions

- Should the header details icon be `Info`, `Settings2`, or `FilePenLine`?
- Should the default language be changed only from Overview, or also through a `Make default` action in Languages?
- Should relation selection get its own reusable picker now, or start as a scoped popover/select inside the CQ editor?
