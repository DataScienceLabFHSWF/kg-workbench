# PostgreSQL provider portability

## Overview

Move application persistence from the Supabase JavaScript client to a
PostgreSQL connection backed by Drizzle, while keeping Supabase Storage optional
and preserving the existing application password/group access model.

## Entry points

- `src/server/database.ts` - provider-independent PostgreSQL persistence client
- `src/server/storage.ts` - optional original-file storage adapter
- `src/server/group-access.ts` - application-owned group isolation checks
- `src/features/documents/server/actions/extraction.ts` - optional file retention
- `deploy/` - PostgreSQL and Supabase storage deployment profiles

## Slices

1. **done** - confirm PostgreSQL-only scope, storage discard behavior, and retained access gate.
2. **done** - add central configuration, Drizzle persistence, and database migration configuration.
3. **done** - migrate server persistence imports and make file retention optional.
4. **done** - split deployment profiles and document the configuration.
5. **done** - add tests and verify lint, types, tests, Compose configuration, and production build.
6. **done** - replace the transitional PostgREST-compatible client with direct, typed Drizzle queries across server features.
