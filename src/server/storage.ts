import "server-only"

import { createClient } from "@supabase/supabase-js"

import { getServerConfig } from "@/server/config"

export interface StorageProvider {
  readonly persistsFiles: boolean
  retainDocument(path: string, file: File): Promise<void>
}

class NoStorageProvider implements StorageProvider {
  readonly persistsFiles = false

  async retainDocument(): Promise<void> {
    // Original files are deliberately discarded after the extraction request.
  }
}

class SupabaseStorageProvider implements StorageProvider {
  readonly persistsFiles = true

  constructor(
    private readonly client: ReturnType<typeof createClient>,
    private readonly bucket: string
  ) {}

  async retainDocument(path: string, file: File): Promise<void> {
    const { error } = await this.client.storage
      .from(this.bucket)
      .upload(path, file, { contentType: file.type })
    if (error) throw error
  }
}

export function createStorageProvider(): StorageProvider {
  const config = getServerConfig()
  if (config.storageProvider === "none") {
    return new NoStorageProvider()
  }

  const supabaseStorage = config.supabaseStorage
  if (!supabaseStorage) {
    throw new Error("Supabase Storage configuration is missing.")
  }

  return new SupabaseStorageProvider(
    createClient(supabaseStorage.url, supabaseStorage.serviceRoleKey),
    "documents"
  )
}
