# 03 - Documents Fact Review and CQ Graph Filtering

Status: `open`

## Goal

Use the new ontology metadata in document review. Relation attributes should be editable on facts, required relation attributes should be visible when missing, and CQs should become one-click graph filters that respect existing document filters.

## Affected Files

- `/src/features/documents/README.md`
- `/src/features/documents/server/queries/`
- `/src/features/documents/server/actions/facts.ts`
- `/src/features/documents/components/fact-card/fact-card.tsx`
- `/src/features/documents/components/fact-card/`
- `/src/features/documents/components/fact-inspector/facts-tab/`
- `/src/features/documents/components/fact-inspector/relations-tab/`
- `/src/features/documents/components/shared/document-filters-toolbar/document-filters-toolbar.tsx`
- `/src/features/documents/components/fact-graph-view.tsx`
- `/src/features/documents/flow/use-fact-graph.ts`
- `/src/features/documents/utils/document-filters.ts`
- `/src/features/documents/hooks/documents-workspace-state.tsx`

## UX Decisions

- Relation attribute values should appear in the fact review UI for facts mapped to an ontology relation.
- Required relation and class attributes should be visibly missing until filled.
- Missing relation attributes should not block acceptance in the first pass unless a later validation decision changes that.
- CQ filtering should respect the current status filters and other active filters.
- CQ filters should be easy to clear without resetting all document filters.
- CQ subject/object instance selectors should be optional and only apply when a CQ has an instance set.

## Slices

### Slice 1 - Document ontology query extension `open`

- Extend `/src/features/documents/server/queries/` `DocumentOntology`.
- Include:
  - CQs and module links
  - relation attributes
  - allowed instances needed for CQ display
- Keep payload compact enough for document review screens.

### Slice 2 - Relation attribute value UI `open`

- Add `/src/features/documents/components/fact-card/relation-attribute-values/relation-attribute-values.tsx`.
- Show relation attribute fields on fact cards when `relation_type_id` is mapped.
- Render values according to relation attribute data type.
- Flag required missing values.
- Add server action support for upserting and deleting relation attribute values.
- Refresh fact data after mutation through the existing query invalidation pattern.

### Slice 3 - Fact inspector relation attribute integration `open`

- Surface required missing relation attributes in facts tab rows.
- Consider showing counts in relation tab summaries:
  - complete
  - missing required relation attributes
- Keep missing required relation attributes visually distinct from unmapped facts.

### Slice 4 - CQ filter state `open`

- Extend `/src/features/documents/hooks/documents-workspace-state.tsx` with an active CQ filter.
- Store enough CQ metadata for display and filtering:
  - CQ id
  - question text
  - subject class id
  - relation id
  - object class id
  - optional subject instance id
  - optional object instance id
- Add clear CQ action that only clears the active CQ filter.

### Slice 5 - CQ filtering logic `open`

- Extend `/src/features/documents/utils/document-filters.ts`.
- Match facts against CQ patterns:
  - subject class if set
  - relation type if set
  - object class if set
  - subject instance if set
  - object instance if set
- Respect existing active status filters.
- Keep partial CQs usable as partial filters.

### Slice 6 - CQ graph control `open`

- Add `/src/features/documents/components/shared/cq-filter-control/cq-filter-control.tsx`.
- Group CQs by module where possible.
- Include `Ontology-wide` group for CQs without modules.
- For multi-module CQs, either show under each module or in a `Multi-module` group; choose the least confusing option during implementation.
- Add the control to graph mode near existing filters or the graph toolbar.
- Selecting a CQ should update filter state and cause `/src/features/documents/flow/use-fact-graph.ts` to receive already-filtered facts.
- If no facts match, show the existing empty state style with CQ-specific text.

### Slice 7 - Graph highlighting and fit behavior `open`

- Highlight facts that match the active CQ if the CQ filter is used as highlight instead of hard filter in a later variant.
- After CQ selection, fit the graph view if the React Flow instance hook is available in the canvas.
- Keep this optional if it would require a larger React Flow refactor.

## Open Questions

- Should CQ filtering hard-filter the graph, or should there also be a highlight-only mode?
- Should multi-module CQs appear once under `Multi-module`, or duplicated under every linked module?
- Should required relation attributes contribute to the existing `unmapped` effective status, or remain a separate visual issue?
