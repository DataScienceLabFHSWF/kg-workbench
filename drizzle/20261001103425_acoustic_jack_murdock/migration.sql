-- Drizzle baseline marker.
--
-- The existing, reviewed migrations in drizzle/baseline/ create the schema.
-- This no-op records the equivalent Drizzle schema snapshot so later generated
-- migrations contain only changes made after the baseline.
SELECT 1;
