-- Adapted for KG Workbench from the Supabase self-hosting distribution.
-- Copyright 2024 Supabase. Apache-2.0; see LICENSES/Supabase-Apache-2.0.txt at the repository root.
\set jwt_secret `echo "$JWT_SECRET"`
\set jwt_exp `echo "$JWT_EXP"`

ALTER DATABASE postgres SET "app.settings.jwt_secret" TO :'jwt_secret';
ALTER DATABASE postgres SET "app.settings.jwt_exp" TO :'jwt_exp';
