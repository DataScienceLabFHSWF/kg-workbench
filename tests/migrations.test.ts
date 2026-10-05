import assert from "node:assert/strict"
import { readFileSync, readdirSync } from "node:fs"
import { test } from "node:test"

test("application migration versions are unique", () => {
  const files = readdirSync(
    new URL("../drizzle/baseline/", import.meta.url)
  ).filter((file) => file.endsWith(".sql"))
  const versions = new Map<string, string>()
  for (const file of files) {
    const match = /^(\d{14})_.+\.sql$/.exec(file)
    assert.ok(match, `Invalid migration filename: ${file}`)
    assert.equal(
      versions.has(match[1]),
      false,
      `Duplicate migration version: ${versions.get(match[1])} and ${file}`
    )
    versions.set(match[1], file)
  }
})

test("application migrations do not require Supabase Storage", () => {
  const files = readdirSync(
    new URL("../drizzle/baseline/", import.meta.url)
  ).filter((file) => file.endsWith(".sql"))

  for (const file of files) {
    const content = readFileSync(
      new URL(`../drizzle/baseline/${file}`, import.meta.url),
      "utf8"
    )
    assert.equal(
      /\bstorage\./i.test(content),
      false,
      `${file} must not depend on Supabase Storage`
    )
  }
})

test("the Drizzle snapshot migration is a no-op", () => {
  const drizzleDirectory = new URL("../drizzle/", import.meta.url)
  const snapshotDirectory = readdirSync(drizzleDirectory, {
    withFileTypes: true,
  })
    .filter((entry) => entry.isDirectory() && entry.name !== "baseline")
    .map((entry) => entry.name)
    .sort()[0]

  assert.ok(snapshotDirectory, "A Drizzle snapshot directory is required")

  const migration = readFileSync(
    new URL(`../drizzle/${snapshotDirectory}/migration.sql`, import.meta.url),
    "utf8"
  )
  const snapshot = readFileSync(
    new URL(`../drizzle/${snapshotDirectory}/snapshot.json`, import.meta.url),
    "utf8"
  )

  assert.match(migration, /Drizzle baseline marker/)
  assert.doesNotMatch(migration, /create\s+table/i)
  assert.match(snapshot, /"tables"/)
})
