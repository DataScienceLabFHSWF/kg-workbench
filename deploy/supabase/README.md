# Supabase Bundle

This folder vendors the compact self-hosted Supabase stack used by the optional
Supabase Storage deployment profile.

It is intentionally separate from the local `supabase/` CLI project and keeps only the services the current app needs plus the Studio support required by this deployment phase:

- `db`
- `rest`
- `auth`
- `storage`
- `kong`
- `meta`
- `studio`

The storage service uses the local filesystem backend, so there is no MinIO container in this phase.

## Migrations

Apply shared PostgreSQL schema changes with:

```bash
bash deploy/scripts/deploy.sh supabase migrate
```

That script creates `public.kg_workbench_schema_migrations` and applies only
migration files that are not already tracked there. It also creates the
Supabase Storage bucket after shared database migrations finish.

If an existing database already contains the older schema but has no migration history yet, baseline the earlier files once and start executing at the first missing migration:

```bash
bash deploy/supabase/scripts/apply-migrations.sh deploy/.env.server --baseline-before 20260423000000_ontology-metadata.sql
```

That records every earlier filename as already applied, then executes `20260423000000_ontology-metadata.sql` and everything after it. Do not load `supabase/seed.sql` in production.
