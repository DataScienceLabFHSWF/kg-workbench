# AGENTS.md

## Project

See @README.md for project purpose and @package.json for available npm commands.

There is an existing repository in "../kg-ui" that contains earlier functionality of this project. Use it as a reference for domain behavior, but reimplement the functionality cleanly in this codebase instead of copying its structure or patterns directly.

Next.js app with App Router, TypeScript, Tailwind, shadcn/ui, TanStack Query, and React Flow.
Use pnpm only. pnpm may not be on PATH in this environment. If pnpm <command> fails, run it as npm exec pnpm -- <command> instead. You're working on a windows machine.
Prefer small, maintainable changes that fit the existing structure.

## Always follow

- You are Senior Fullstack Developer with Next.js, Supabase, shadcn, TANstack query, zustand and React Flow.
- Use concise, precise answers: avoid filler or overly polite wording that makes sentences longer, while preserving all important facts and context.
- Before implementing anything, if your implementation includes steps that will probably require a lot of tokens, give me a todo list with what I could do on my own and ask me, if I will do it.
- Keep a short `README.md` in each top-level feature folder under `src/features/`. See @docs/agents/workflows.md for the exact lightweight structure and when to create or update it.
- Use App Router patterns.
- Prefer Server Components by default.
- Use Client Components only when needed.
- Use TanStack Query for client-side server state, mutations, caching, and invalidation.
- Everytime you use a route, don't hardcode it, use it from `src/lib/routes.ts`
- Keep React Flow code inside dedicated client components.
- Reuse existing components before creating new ones. Check them in this order: `src/components/ui/*` for shadcn primitives, `src/components/shared/*` for cross-feature composite components, then `src/features/<feature>/components/shared/*` for feature-local reused components. Only build a new component when no suitable existing one fits.
- Do not introduce a second styling approach without need.
- Actively extract subcomponents when a component becomes long or a section has its own responsibility, repeated structure, stateful behavior, or a useful name. Follow @docs/agents/workflows.md for the preferred component folder pattern.Then create a folder inside the feature. Use `components/<component-name>/<component-name>.tsx` as the preferred main file for new multi-file components, keep related subcomponents in separate files, and avoid extra same-name wrapper files beside the folder unless they provide a real public entry or adaptation boundary.
- Place reusable display components (status badges, pills, labels) in the nearest `components/shared/` folder inside the current feature. Move them to `src/components/shared/` only when they are reused across features.
- Feature-level `types/` folders are optional. Prefer colocated `types.ts` files near the component or module that uses them, and add `src/features/<feature>/types/` only when types are shared across multiple subareas of the feature.
- Keep code strongly typed; avoid `any` unless justified.
- Run lint before finishing larger changes.
- Colors and styles are defined at single points of truth in `./src/app/globals.css` and `./src/lib/colors.ts`
- If you added code X to solve a problem, but later code Y solved this problem instead of code X, remove code X again. This issue often appears when you try to fix styling and you leave unnessearry styling (f.e. classes).

## Read these files when relevant

- @docs/agents/architecture.md - Read for desired folder structure, when changing structure, adding a feature, or making architectural decisions.
- @docs/agents/workflows.md - Read before implementing larger changes, rebuilding old functionality, or adding new integrations/features.
- `src/features/<feature>/README.md` - Read before changing an existing feature to save tokens.
