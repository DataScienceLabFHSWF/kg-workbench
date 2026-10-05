# Architecture

## Architectural Decisions

- Use **Next.js App Router**
- Structure code **by feature**
- Prefer **Server Components** for reads
- Prefer **Server Actions** for writes and backend-owned logic
- Use **React Query** only for long-running or highly interactive async workflows
- Use **React Flow** only inside dedicated client components
- Use **shadcn/ui** as the default UI foundation
- Keep components small and focused

---

## Data Strategy

### Use Server Components for

- loading ontology data
- loading persisted graph data
- loading review data for initial page render

### Use Server Actions for

- creating and editing ontology modules, classes, and edges
- saving review decisions
- remapping extracted instances
- importing accepted triples into the knowledge graph
- starting extraction runs
- writing to the database

### Use React Query for

- polling extraction status
- refreshing extraction results on interactive review screens
- client-heavy workflows that need invalidation/refetching

Rule of thumb:

- **local app data + writes** -> Server Actions
- **long-running external process state** -> React Query

---

## React Flow

React Flow is a core part of the app and is used for:

1. visualizing ontology modules and their relations
2. previewing extracted/reviewed triples as graph structures

Rules:

- keep React Flow code in dedicated client components
- do not place flow logic directly in page files
- split graph UIs into smaller parts instead of building one large flow component

---

## Feature Structure

Use a feature-first structure.
Each feature should own its UI, server logic, schemas, and helpers.
Only create the subfolders a feature actually needs.

Example:

```text
src/features/ontology/
  README.md
  components/
  flow/
  server/
  schemas/
  utils/
  hooks/      # optional
  types/      # optional, only for types shared across multiple subareas
```

Other features should follow the same structure where it makes sense.

Prefer colocated `types.ts` files near the component or module that uses them.
Use a feature-level `types/` folder only when those types are shared across multiple subareas of the same feature.

For multi-file components, prefer this structure for new work:

```text
components/
  class-browser/
    class-browser.tsx
    class-browser-item.tsx
    types.ts
```

Avoid extra same-name wrapper files beside the folder unless they provide a real public entry or adaptation boundary.

Each top-level feature folder should also contain a short `README.md` with two parts:

### YAML header

Use these YAML header fields:

- `feature`: short feature identifier used for quick scanning
- `status`: current maturity or lifecycle state
- `purpose`: one-line summary of what the feature exists to do
- `scope`: short list of what belongs inside the feature
- `entry_points`: main route or shell files, each with a one-line purpose
- `server_entry_points`: main server-side files, each with a one-line purpose when relevant
- `update_this_readme_when`: short list of changes that should trigger a README refresh

### Markdown sections:

- `Domain Concepts`: important business terms with very short explanations
- `Flow`: numbered path through the feature from route to key subcomponents and persistence
- `Constraints`: feature-specific implementation rules worth seeing early

Keep it short, specific, and current so agents can load feature context without reading the whole feature first.

---

## Folder Responsibilities

- `app/` -> route composition only
- `features/` -> primary location for domain logic
- `components/ui/` -> shared shadcn-based UI primitives only
- `components/shared/` -> cross-feature reusable composite UI components
- `server/` -> cross-feature backend infrastructure
- `domain/` -> DB type aliases split by domain (`ontology.ts`, `documents.ts`, etc.) derived from the Drizzle schema
- `server/db/` -> PostgreSQL connection and Drizzle schema definitions
- `lib/` -> small shared utilities and types
- `mocks/` -> mocking external server responses with MSW
- `hooks/` -> hooks that are application wide or shared between features

Within a feature:

- `components/shared/` -> feature-local reusable display and helper components
- `hooks/` -> feature-local hooks when they are not shared app-wide
- `types/` -> optional feature-local shared types; prefer colocated `types.ts` by default

---

## External Pipeline Integration

External extraction and ontology-generation pipelines must be wrapped behind internal server-side adapters.

Rules:

- never call secret external APIs directly from the browser
- mock external pipelines first if needed
- persist run state locally in the app
- client UI should read persisted run state, not own the source of truth

---

## Scaling Direction

This architecture is intended for a growing fullstack app:

- frontend and backend logic live in the same Next.js project
- external APIs can start mocked
- auth may be added later
- new ontology, review, and graph workflows should fit into the same feature structure
