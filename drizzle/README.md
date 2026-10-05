# Drizzle migrations

`baseline/` contains the existing applied SQL baseline for KG Workbench
databases. Those migrations are standard PostgreSQL except for the storage
bucket bootstrap, which is now supplied only by the Supabase deployment. The
checked-in no-op generated migration records Drizzle's matching schema snapshot
without recreating the baseline tables.

## Workflow

1. Change `src/server/db/schema.ts`.
2. With `DATABASE_URL` set, run `pnpm db:generate`.
3. Review the generated `drizzle/<timestamp_name>/migration.sql` and commit it.
   Its accompanying `snapshot.json` is Drizzle's schema state for the next diff.
4. Apply migrations with
   `bash deploy/scripts/deploy.sh <postgres|supabase> migrate`.

The deployment migration runner applies `baseline/*.sql` first, then the
generated Drizzle migration folders. Do not edit baseline migrations; add all
new schema changes through the workflow above.

Do not use `drizzle-kit push` for a deployed database.
