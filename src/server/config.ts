import { z } from "zod"

const storageProviderSchema = z.enum(["none", "supabase"])

export type StorageProviderName = z.infer<typeof storageProviderSchema>

export interface ServerConfig {
  databaseUrl: string
  storageProvider: StorageProviderName
  supabaseStorage?: {
    url: string
    serviceRoleKey: string
  }
}

type Environment = Record<string, string | undefined>

/**
 * Resolve server-only infrastructure once, without exposing provider details to
 * the client. DATABASE_URL always addresses PostgreSQL, including Supabase
 * hosted PostgreSQL.
 */
export function getServerConfig(
  environment: Environment = process.env
): ServerConfig {
  const databaseUrl = environment.DATABASE_URL?.trim()
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required.")
  }

  const storageProvider = storageProviderSchema.safeParse(
    environment.STORAGE_PROVIDER ?? "none"
  )
  if (!storageProvider.success) {
    throw new Error('STORAGE_PROVIDER must be either "none" or "supabase".')
  }

  if (storageProvider.data === "none") {
    return { databaseUrl, storageProvider: "none" }
  }

  const url = environment.SUPABASE_URL?.trim()
  const serviceRoleKey = environment.SUPABASE_SERVICE_ROLE_KEY?.trim()
  if (!url || !serviceRoleKey) {
    throw new Error(
      "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required when STORAGE_PROVIDER=supabase."
    )
  }

  return {
    databaseUrl,
    storageProvider: "supabase",
    supabaseStorage: { url, serviceRoleKey },
  }
}

export function getServerCapabilities(environment: Environment = process.env) {
  const config = getServerConfig(environment)
  return {
    persistentFileStorage: config.storageProvider !== "none",
  } as const
}
