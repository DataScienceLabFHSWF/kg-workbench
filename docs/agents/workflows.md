# Workflows

## General Rule

Do not start implementing if important ambiguities still exist.
First clarify them in the chat.

When checking an existing feature, first read its local `src/features/<feature>/README.md` if present to get an overview.
When you create a feature or materially change a feature's flow, entry points, domain concepts, or scope, create or update that file before finishing. Skip it for very small refactors that do not change feature understanding.

Before implementation, provide a short plan covering:

- goal
- affected features/files
- implementation approach.
- open questions

Only implement after alignment.

---

## Making plans

- If a change is too large to implement safely in a single run, create a plan under `/docs/plans`.

- If the plan is small enough, use a single file named:
  `<enumeration>-<plan-name>.md`

- Split the work into slices that are each small enough to implement in one run.
- Every slice must clearly indicate whether it is `open` or `done`.
- Also always be precise when talking about components by not only naming them but providing their location (f.e. instead of saying fact-inspector say `/src/features/documents/components/fact-inspector`)

- If the plan becomes too large for a single file, create a folder named:
  `/docs/plans/<enumeration>-<plan-name>/`

- Inside that folder, create an `index.md` that provides:
  - a short overview of the plan
  - links to all relevant entry-points (may be folders, components, features)
  - links to all sub-plans
  - the status of each sub-plan (`open` or `done`)
  - List which (new) subcomponents the components you will create/edit will include to ensure that you don't write too long components

- Store all sub-plans in that same folder.
  Sub-plans should also be broken into slices when appropriate, with explicit status tracking.

---

## Implementing New Features

For new features, prefer this order:

1. clarify scope and open questions
2. create the feature folder `README.md` with the agreed short structure
3. define or update schemas and colocated types; add a feature-level `types/` folder only if types are shared across multiple subareas
4. implement UI
5. add flow-specific components if needed
6. implement server-side logic
7. verify the result yourself

Keep new code inside the appropriate feature folder.

When adding or expanding a multi-file component:

- prefer `components/<component-name>/<component-name>.tsx` as the main file for new work
- keep helper parts, small subcomponents, and local `types.ts` files next to that main file
- avoid extra same-name wrapper files beside the folder unless they provide a stable public entry or feature-specific adaptation

---

## External API Integrations

For external pipeline integrations:

- start with a mock implementation if the real integration is not ready
- wrap external APIs behind server-side adapters
- never call secret external APIs directly from the browser
- keep the external integration swappable without changing feature UI code

---

## UI Work

When building UI:

- first compose from existing shadcn/ui components
- only create custom components when needed
- keep components small and focused
- actively split a component when a part has its own clear responsibility, repeated structure, stateful behavior, substantial markup, or a name that would make the parent easier to read
- for extracted feature components, follow the multi-file component pattern above and prefer `components/<component-name>/<component-name>.tsx` as the main file
- do not recreate primitives that shadcn already provides

---

## React Flow Work

When working with React Flow:

- keep nodes, edges, and canvas-related logic separated
- do not place flow-specific logic directly in page files
- keep mapping between domain data and flow data explicit
- avoid large monolithic flow components

---

## Verification

Claude must always verify changes independently before finishing.

At minimum:

- run lint
- run build if the change may affect integration or app structure
- check that the implemented result matches the requested behavior

If something cannot be verified, state that clearly.
