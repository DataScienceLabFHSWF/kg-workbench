-- Adapted for KG Workbench from the Supabase self-hosting distribution.
-- Copyright 2024 Supabase. Apache-2.0; see LICENSES/Supabase-Apache-2.0.txt at the repository root.
\set pguser `echo "$POSTGRES_USER"`

CREATE DATABASE _supabase WITH OWNER :pguser;
