# KG Workbench

## Project Purpose

This app is used to:

1. create and manage modular ontologies
2. visualize ontology modules and their relations
3. extract triples from documents based on ontology classes and edges
4. let users review extracted triples:
   - accept
   - reject
   - remap instances to another ontology class
5. import accepted triples into an existing knowledge graph

The app persists ontology data, review state, and knowledge graph related data
in PostgreSQL. That database can be plain PostgreSQL or Supabase-hosted
PostgreSQL; retaining original uploaded files through Supabase Storage is
optional.

The repository includes two extraction options:

- **Internal extractor:** the bundled Python FastAPI service in
  [`services/internal-extractor`](services/internal-extractor). It uses Neo4j
  GraphRAG with OpenAI, Anthropic, or Ollama and is the default option in the
  document upload flow.
- **External extractor:** an optional compatible HTTP API configured through
  `EXTRACTION_API_URL` or entered in the upload flow.

The internal extractor is included in both `deploy/` deployment profiles as the
`extraction` service. API keys for OpenAI and Anthropic are entered for an
individual extraction request; Ollama is reached through the extractor's
`OLLAMA_BASE_URL`.

## Server Deployment

For the self-hosted Docker Compose server setup, migration application, and update steps after new commits, see [deploy/README.md](deploy/README.md).

## Local Development

The recommended development setup is:

- run a PostgreSQL or Supabase Storage profile plus the internal extractor from
  `deploy/`
- run the Next.js frontend locally with `pnpm dev`

This keeps the stateful infrastructure and extractor close to the deployed
configuration, while Next.js retains fast hot reload, local debugging, and direct
access to frontend tooling. It also avoids running a second Supabase stack through
the Supabase CLI.

Prerequisites: Node.js 22, Docker Desktop, and a shell capable of running the
deployment scripts (Git Bash, WSL, or another Bash environment). Use the pnpm
version pinned in `package.json`; enable it with `corepack enable`.

### First-time setup

1. Install dependencies:

   ```bash
   pnpm install --frozen-lockfile
   ```

2. Choose a deployment profile and create its environment:

   ```bash
   # Plain PostgreSQL; original uploaded files (used for KG extraction) are discarded after extraction.
   cp deploy/.env.postgres.example deploy/.env.server

   # Or, PostgreSQL with Supabase Storage and administration tools.
   cp deploy/.env.server.example deploy/.env.server
   ```

   In PowerShell, use the matching `Copy-Item` command instead.

3. Only for the Supabase profile, generate its service credentials:

   ```bash
   sh deploy/supabase/utils/generate-keys.sh --update-env
   ```

4. Start the chosen profile and bundled internal extractor. The `app` service is
   omitted because Next.js will run locally:

   ```bash
   bash deploy/scripts/deploy.sh postgres up
   # or
   bash deploy/scripts/deploy.sh supabase up
   ```

5. Apply the application migrations:

   ```bash
   bash deploy/scripts/deploy.sh postgres migrate
   # or
   bash deploy/scripts/deploy.sh supabase migrate
   ```

   For the Supabase profile only, refresh PostgREST after migrations:

   ```
   docker compose --env-file deploy/.env.server -f deploy/compose.yaml -f deploy/providers/supabase.yaml restart rest
   ```

   The deploy stack intentionally does not load `supabase/seed.sql`; an existing
   development database keeps its data.

6. Copy the frontend environment file:

   ```bash
   cp .env.local.example .env.local
   ```

   In PowerShell, use `Copy-Item .env.local.example .env.local`.

   The defaults connect the local Next.js process to the Compose ports:

   ```bash
   DATABASE_URL=postgresql://postgres:<POSTGRES_PASSWORD>@127.0.0.1:5433/postgres
   STORAGE_PROVIDER=none
   INTERNAL_EXTRACTION_API_URL=http://127.0.0.1:8010
   NEXT_PUBLIC_USE_MOCKS=false
   ```

   `DATABASE_URL` points directly to PostgreSQL in either profile. To retain
   original uploads with the Supabase profile, set `STORAGE_PROVIDER=supabase`,
   `SUPABASE_URL=http://127.0.0.1:8503`, `DATABASE_URL` (`replace-me` to `POSTGRES_PASSWORD`) and `SUPABASE_SERVICE_ROLE_KEY` to the
   value from `deploy/.env.server`.

7. Start Next.js locally:

   ```bash
   pnpm dev
   ```

Open `http://localhost:3000`. Supabase Studio is available at
`http://127.0.0.1:55432`. The internal extractor is available at
`http://127.0.0.1:8010`; its health endpoint is `/health`.

### Daily development

Start or refresh the selected infrastructure profile, then run the frontend:

```bash
bash deploy/scripts/deploy.sh postgres up
# or
bash deploy/scripts/deploy.sh supabase up
pnpm dev
```

After pulling new migrations, apply them using the same profile. Refresh
PostgREST only for the Supabase profile:

```bash
bash deploy/scripts/deploy.sh postgres migrate
# or
bash deploy/scripts/deploy.sh supabase migrate
docker compose --env-file deploy/.env.server -f deploy/compose.yaml -f deploy/providers/supabase.yaml restart rest
```

Rebuild the extractor after changes under `services/internal-extractor/`:

```bash
bash deploy/scripts/deploy.sh postgres up
# or
bash deploy/scripts/deploy.sh supabase up
```

The internal extractor is selected by default in the document upload dialog.
Choose Ollama for a local model, or OpenAI/Anthropic and provide the API key in the
dialog. Set `NEXT_PUBLIC_USE_MOCKS=true` only when deliberately testing the mocked
external extraction API.

### Alternative: Supabase CLI

The Supabase CLI workflow remains useful when you want a disposable database that
can be recreated and seeded in one command:

```bash
pnpm exec supabase start
pnpm db:reset-local
pnpm exec supabase status -o env
```

For this workflow, point `DATABASE_URL` in `.env.local` to the direct database
URL reported by `supabase status`, change `SUPABASE_URL` to
`http://127.0.0.1:54321` only if `STORAGE_PROVIDER=supabase`, use the
service-role key printed by `supabase status`, and run the internal extractor
separately as described in
[`services/internal-extractor/README.md`](services/internal-extractor/README.md).
Do not run the CLI Supabase stack and the Compose Supabase stack at the same time
unless you intentionally want two independent databases.

When the PostgreSQL schema changes, update `src/server/db/schema.ts` alongside
the reviewed SQL migration. Future Drizzle migrations are generated into
`drizzle/` with `pnpm db:generate` and applied with the selected deployment
profile's `migrate` command. Do not use `drizzle-kit push` for an existing
database.

The default local configuration uses an unprotected `shared` workspace. A Supabase
CLI reset loads the seed ontology and documents; the recommended Compose workflow
does not seed the database automatically. Everyone who can reach the installation
can read and edit the shared workspace. For a shared-password installation, enable
`APP_PASSWORD_PROTECTION_ENABLED` and set `APP_PASSWORD`; it uses the same workspace.
For separate protected workspaces, also set `APP_ACCESS_GROUPS`, for example
`Team A:replace-this-password,Team B:replace-that-password`. Those groups have their
own data and do not see the shared seed dataset. Changing access modes does not
transfer existing data between workspaces.

Read [SECURITY.md](SECURITY.md) before exposing an installation to other users.

## Checks and dependency updates

Use the check that matches the change and development stage:

- During regular development, run `pnpm check`. It lints, typechecks, runs the web
  regression tests, and creates a production build.
- Before pushing or opening a pull request, run `pnpm check:all`. In addition to
  the web checks, it verifies the locked install, extractor tests, JavaScript and
  Python dependency audits, and the Git-history secret scan used by CI. It
  requires `uv`; the pinned Gitleaks release is downloaded, checksum-verified,
  and cached automatically. Set `GITLEAKS_BIN` only to override it with an
  existing executable.
- After database or migration changes, run `pnpm check:all -- --database`. This
  resets and verifies the local Supabase CLI database. Use it only with a
  disposable database and never with data you need to keep.
- When intentionally updating JavaScript dependencies, run:

  ```bash
  pnpm deps:update
  pnpm check:all
  ```

`pnpm deps:update` (or `npm run deps:update`) updates all JavaScript dependencies to
their latest stable versions using pnpm, including major versions. Review the
changes before committing. Python updates are described in
[CONTRIBUTING.md](CONTRIBUTING.md).

## Contributing and licensing

See [CONTRIBUTING.md](CONTRIBUTING.md), [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md), and
[the first-release checklist](docs/OPEN_SOURCE_RELEASE.md).

Project code is licensed under [MIT](LICENSE.txt), copyright 2026
DataScienceLabFHSWF. Third-party material retains its upstream licenses; see
[THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
