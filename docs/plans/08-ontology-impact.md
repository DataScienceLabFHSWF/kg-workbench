# 08 - Ontology Impact Tracking (Future Phase)

## Goal

Add the ability to track and display the downstream impact of ontology edits on extracted facts and documents.

---

## Scope

When a user edits or deletes an ontology class or relation, the system should:

1. Identify all facts that reference the changed class/relation.
2. Surface these as "impacted" in the UI (e.g., warning badges, filtered views).
3. Optionally allow bulk re-review or re-extraction of impacted facts.

---

## Slices (to be detailed when this phase begins)

### Slice 1 — Impact query layer `open`

- The following datas-tructure is legacy and includes the old database structure I guess. With introduction of attributes we changed this. Check it before.
  - Query functions to find facts by `subject_class_id`, `object_class_id`, `relation_type_id`.
- Count impacted facts per class/relation.

### Slice 2 — Impact display in ontology detail panels `open`

- Show "X facts use this class" / "X facts use this relation" counts in the class/relation detail panels.
- Warning when deleting a class/relation that has linked facts.

### Slice 3 — Impact display in documents `open`

- Badge on facts whose ontology class/relation was recently modified.
- Filter to show only "impacted" facts.

### Slice 4 — Bulk re-review `open`

- Action to reset impacted facts to `pending` review status.
- Optional: trigger re-extraction for impacted document sections.
