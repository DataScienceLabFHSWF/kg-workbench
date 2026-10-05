# Deployment

KG Workbench has two PostgreSQL deployment profiles. The application always
uses `DATABASE_URL` for database access; Supabase is optional infrastructure for
original-file storage and its administration tools.

## Profiles

| Profile    | Services                                                     | File retention      |
| ---------- | ------------------------------------------------------------ | ------------------- |
| `postgres` | app, extractor, PostgreSQL                                   | disabled by default |
| `supabase` | app, extractor, PostgreSQL, PostgREST, Storage, Kong, GoTrue | Supabase Storage    |

The existing password/group access gate is independent of both profiles.

## First boot

Copy the matching environment template:

```bash
cp deploy/.env.postgres.example deploy/.env.server
# or, for the full Supabase Storage profile:
cp deploy/.env.server.example deploy/.env.server
```

For the Supabase profile, generate the matching service credentials first:

```bash
sh deploy/supabase/utils/generate-keys.sh --update-env
```

Start the selected profile and apply the PostgreSQL baseline plus any reviewed
Drizzle migrations:

```bash
bash deploy/scripts/deploy.sh postgres up
bash deploy/scripts/deploy.sh postgres migrate

# or
bash deploy/scripts/deploy.sh supabase up
bash deploy/scripts/deploy.sh supabase migrate
```

`migrate` creates the `documents` bucket only for the `supabase` profile. The
plain PostgreSQL profile deliberately has no `storage` schema dependency.

## Operations

```bash
bash deploy/scripts/deploy.sh postgres ps
bash deploy/scripts/deploy.sh supabase logs
bash deploy/scripts/deploy.sh postgres down
```

The application and database ports bind to loopback by default. The Compose
stack still joins the external `app_web` network for the host platform reverse
proxy.

## Environment

Every profile needs `POSTGRES_PASSWORD`. The application receives an internal
`DATABASE_URL` from the selected Compose provider. For a non-Compose or managed
deployment, set `DATABASE_URL` directly.

`STORAGE_PROVIDER=none` discards the original upload after the extraction
request. `STORAGE_PROVIDER=supabase` requires `SUPABASE_URL` and
`SUPABASE_SERVICE_ROLE_KEY`; those credentials are used only by the storage
adapter.

Supabase Studio is optional in the `supabase` provider and is started with the
Compose `admin` profile when needed.
