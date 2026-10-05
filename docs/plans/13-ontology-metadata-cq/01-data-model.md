# 01 - Data Model

Status: `done`

## Goal

Add durable schema support for ontology metadata, CQs, translations, notes, examples, allowed instances, relation attributes, and relation attribute values on reviewed document facts.

## Affected Files

- `/drizzle/baseline/`
- `/supabase/seed.sql`
- `/src/domain/ontology.ts`
- `/src/domain/documents.ts`
- `/src/domain/database.types.ts`
- `/src/features/ontology/server/queries/`
- `/src/features/ontology/server/actions/`
- `/src/features/documents/server/queries/`
- `/src/features/documents/server/actions/`

## Proposed Tables and Columns

- `ontology_documents`
  - add `default_language text not null default 'en'`
  - add `usecase text not null default ''`

- `ontology_modules`
  - add `description text not null default ''`

- `ontology_relations`
  - add `required boolean not null default false`

- `ontology_languages`
  - stores available editor languages per ontology
  - one default language per ontology

- `ontology_competency_questions`
  - stores CQ text and SPO pattern fields
  - supports ontology-wide CQs when no module links exist

- `ontology_competency_question_modules`
  - many-to-many CQ to module links

- `ontology_localized_texts`
  - reusable editor-only translations for target fields like `name`, `description`, `question`, and `example`

- `ontology_notes`
  - reusable notes for ontology, module, class, relation, class attribute, relation attribute, and CQ targets

- `ontology_examples`
  - structured examples for class instances, attribute values, relation triples, relation attributes, and CQs

- `ontology_allowed_instances`
  - class-owned instance suggestions
  - supports future `open` vs `controlled` validation behavior

- `ontology_relation_attributes`
  - relation-owned fact/edge attribute definitions

- `fact_relation_attribute_values`
  - document fact values for mapped relation attributes

## Slices

### Slice 1 - Core metadata columns `open`

- Add `ontology_documents.default_language`.
- Add `ontology_documents.usecase`.
- Add `ontology_modules.description`.
- Add `ontology_relations.required`.
- Backfill defaults for existing rows.
- Update `/src/domain/ontology.ts` aliases only if generated types require new convenience aliases after type generation.

### Slice 2 - Languages, translations, and notes `open`

- Add `ontology_languages`.
- Add `ontology_localized_texts`.
- Add `ontology_notes`.
- Use target metadata fields that can address ontology documents, modules, classes, relations, class attributes, relation attributes, and CQs.
- Add constraints that prevent duplicate localized values for the same target, field, and language.

### Slice 3 - Competency questions `open`

- Add `ontology_competency_questions`.
- Add `ontology_competency_question_modules`.
- Store:
  - question text
  - subject class id
  - predicate relation id
  - object class id
  - optional subject instance id
  - optional object instance id
  - sort order
- Allow nullable pattern fields so partial CQs can be drafted.
- Allow zero module links for ontology-wide CQs.

### Slice 4 - Examples and allowed instances `open`

- Add `ontology_allowed_instances`.
- Add class-level `instance_policy` if this is best as a column on `ontology_classes`; default to `open`.
- Add `ontology_examples` for structured examples.
- Keep allowed instances as suggestions/examples first.
- Do not block fact acceptance based on allowed instances in this slice.

### Slice 5 - Relation attributes and fact values `open`

- Add `ontology_relation_attributes`.
- Add `fact_relation_attribute_values`.
- Mirror class attribute fields where appropriate:
  - name
  - data type
  - required
  - description
- Add relation attribute value uniqueness on `fact_id + relation_attribute_id`.
- Make deletion cascade from relation attributes to fact values.

### Slice 6 - Query and action surface `open`

- Extend ontology read queries to include:
  - module descriptions
  - languages
  - CQs and module links
  - localized texts
  - notes
  - examples
  - allowed instances
  - relation attributes
- Add focused server actions for each metadata area under `/src/features/ontology/server/actions/`.
- Extend document ontology queries with relation attributes and CQ patterns needed by fact review and graph filtering.
- Add document server actions for relation attribute values.

## Open Questions

- Should `ontology_languages.is_default` duplicate `ontology_documents.default_language`, or should the document column be the single source of truth?
- Should relation attribute value `value` use `jsonb` like entity attribute values, or typed text columns?
- Should notes support title/author/timestamps now, or stay as plain ordered bodies until auth exists?
