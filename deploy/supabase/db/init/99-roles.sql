\set pgpass `echo "$POSTGRES_PASSWORD"`

CREATE EXTENSION IF NOT EXISTS pgcrypto;

SELECT 'CREATE ROLE anon NOLOGIN NOINHERIT'
WHERE NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon')\gexec

SELECT 'CREATE ROLE authenticated NOLOGIN NOINHERIT'
WHERE NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated')\gexec

SELECT 'CREATE ROLE service_role NOLOGIN NOINHERIT BYPASSRLS'
WHERE NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'service_role')\gexec

SELECT format(
  'CREATE ROLE authenticator LOGIN NOINHERIT PASSWORD %L',
  :'pgpass'
)
WHERE NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticator')\gexec

SELECT format(
  'CREATE ROLE supabase_auth_admin LOGIN PASSWORD %L',
  :'pgpass'
)
WHERE NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'supabase_auth_admin')\gexec

SELECT format(
  'CREATE ROLE supabase_storage_admin LOGIN PASSWORD %L',
  :'pgpass'
)
WHERE NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'supabase_storage_admin')\gexec

SELECT format(
  'CREATE ROLE supabase_functions_admin LOGIN PASSWORD %L',
  :'pgpass'
)
WHERE NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'supabase_functions_admin')\gexec

SELECT format(
  'CREATE ROLE pgbouncer LOGIN PASSWORD %L',
  :'pgpass'
)
WHERE NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'pgbouncer')\gexec

SELECT format(
  'CREATE ROLE supabase_admin LOGIN SUPERUSER CREATEDB CREATEROLE REPLICATION BYPASSRLS PASSWORD %L',
  :'pgpass'
)
WHERE NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'supabase_admin')\gexec

ALTER ROLE authenticator WITH PASSWORD :'pgpass';
ALTER ROLE pgbouncer WITH PASSWORD :'pgpass';
ALTER ROLE supabase_auth_admin WITH PASSWORD :'pgpass';
ALTER ROLE supabase_functions_admin WITH PASSWORD :'pgpass';
ALTER ROLE supabase_storage_admin WITH PASSWORD :'pgpass';
ALTER ROLE supabase_admin WITH PASSWORD :'pgpass';

GRANT anon TO authenticator;
GRANT authenticated TO authenticator;
GRANT service_role TO authenticator;

GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES FOR USER postgres IN SCHEMA public
  GRANT ALL ON TABLES TO postgres, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES FOR USER postgres IN SCHEMA public
  GRANT ALL ON FUNCTIONS TO postgres, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES FOR USER postgres IN SCHEMA public
  GRANT ALL ON SEQUENCES TO postgres, anon, authenticated, service_role;

ALTER ROLE anon INHERIT;
ALTER ROLE authenticated INHERIT;
ALTER ROLE service_role INHERIT;
ALTER ROLE anon SET statement_timeout = '3s';
ALTER ROLE authenticated SET statement_timeout = '8s';
