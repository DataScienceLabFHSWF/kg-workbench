CREATE SCHEMA IF NOT EXISTS auth;
CREATE SCHEMA IF NOT EXISTS storage;

GRANT ALL ON SCHEMA auth TO postgres, supabase_auth_admin;
GRANT ALL ON SCHEMA storage TO postgres, supabase_storage_admin;
GRANT USAGE ON SCHEMA storage TO anon, authenticated, service_role;
