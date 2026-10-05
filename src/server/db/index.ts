import "server-only"

import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres"
import { Pool, types } from "pg"

import { getServerConfig } from "@/server/config"

// Keep timestamps compatible with the string values previously returned by the
// HTTP database API and declared in the application's domain types.
types.setTypeParser(types.builtins.TIMESTAMPTZ, (value) => value)

type DrizzleDatabase = NodePgDatabase

declare global {
  var kgWorkbenchDatabasePool: Pool | undefined
  var kgWorkbenchDrizzle: DrizzleDatabase | undefined
}

function getDrizzleDatabase(): DrizzleDatabase {
  if (!globalThis.kgWorkbenchDrizzle) {
    const pool = new Pool({ connectionString: getServerConfig().databaseUrl })
    globalThis.kgWorkbenchDatabasePool = pool
    globalThis.kgWorkbenchDrizzle = drizzle({ client: pool })
  }
  return globalThis.kgWorkbenchDrizzle
}

export function getDb(): DrizzleDatabase {
  return getDrizzleDatabase()
}
