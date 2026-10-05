import assert from "node:assert/strict"
import { test } from "node:test"

import { getServerCapabilities, getServerConfig } from "../src/server/config"

test("PostgreSQL requires one DATABASE_URL and defaults to no storage", () => {
  const config = getServerConfig({
    DATABASE_URL: "postgresql://postgres:password@db:5432/kg",
  })

  assert.equal(config.storageProvider, "none")
  assert.deepEqual(
    getServerCapabilities({
      DATABASE_URL: "postgresql://postgres:password@db:5432/kg",
    }),
    { persistentFileStorage: false }
  )

  assert.throws(() => getServerConfig({}), /DATABASE_URL/)
})

test("Supabase Storage requires only its own credentials", () => {
  const config = getServerConfig({
    DATABASE_URL: "postgresql://postgres:password@db:5432/kg",
    STORAGE_PROVIDER: "supabase",
    SUPABASE_URL: "https://storage.example.test",
    SUPABASE_SERVICE_ROLE_KEY: "service-role-key",
  })

  assert.equal(config.storageProvider, "supabase")
  assert.equal(config.supabaseStorage?.url, "https://storage.example.test")
})

test("Supabase Storage rejects missing credentials", () => {
  assert.throws(
    () =>
      getServerConfig({
        DATABASE_URL: "postgresql://postgres:password@db:5432/kg",
        STORAGE_PROVIDER: "supabase",
      }),
    /SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY/
  )
})
