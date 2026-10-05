import { spawnSync } from "node:child_process"
import { existsSync, readFileSync, readdirSync } from "node:fs"
import { basename, join, relative } from "node:path"
import { fileURLToPath } from "node:url"
import { Client } from "pg"

const projectRoot = fileURLToPath(new URL("../", import.meta.url))
const runner = process.env.npm_execpath

if (!runner) {
  throw new Error("Run this script with pnpm db:reset-local.")
}

function runSupabase(args) {
  const pnpmArgs = /^pnpm\.(?:c?js|mjs)$/.test(basename(runner))
    ? ["exec", "supabase", ...args]
    : [
        "exec",
        "--yes",
        "--package=pnpm@11.2.2",
        "--",
        "pnpm",
        "exec",
        "supabase",
        ...args,
      ]
  const result = spawnSync(process.execPath, [runner, ...pnpmArgs], {
    cwd: projectRoot,
    stdio: "inherit",
  })

  if (result.error) {
    throw result.error
  }
  if (result.status !== 0) {
    throw new Error(
      `supabase ${args.join(" ")} failed with exit code ${result.status ?? 1}.`
    )
  }

  return result.stdout
}

function getLocalDatabaseUrl() {
  const configuredPort = readFileSync(
    join(projectRoot, "supabase", "config.toml"),
    "utf8"
  ).match(/^\[db\][\s\S]*?^port\s*=\s*(\d+)/m)?.[1]

  if (!configuredPort) {
    throw new Error("Could not determine the local Supabase database port.")
  }

  // The local Supabase CLI publishes PostgreSQL with these fixed credentials.
  // Avoid `supabase status --output env`: its quoted, redacted output is not a
  // reliable connection string when CI masks database credentials.
  return `postgresql://postgres:postgres@127.0.0.1:${configuredPort}/postgres`
}

const baselineDirectory = join(projectRoot, "drizzle", "baseline")
const baselineMigrations = readdirSync(baselineDirectory)
  .filter((name) => name.endsWith(".sql"))
  .sort()
  .map((name) => join(baselineDirectory, name))

const generatedMigrations = readdirSync(join(projectRoot, "drizzle"), {
  withFileTypes: true,
})
  .filter((entry) => entry.isDirectory() && entry.name !== "baseline")
  .map((entry) => join(projectRoot, "drizzle", entry.name, "migration.sql"))
  .filter(existsSync)
  .sort()

runSupabase(["db", "reset", "--local", "--no-seed"])

const client = new Client({ connectionString: getLocalDatabaseUrl() })
await client.connect()

try {
  for (const migration of [...baselineMigrations, ...generatedMigrations]) {
    console.log(`Applying ${relative(projectRoot, migration)}`)
    await client.query(readFileSync(migration, "utf8"))
  }

  console.log("Seeding supabase/seed.sql")
  await client.query(
    readFileSync(join(projectRoot, "supabase", "seed.sql"), "utf8")
  )
} finally {
  await client.end()
}
