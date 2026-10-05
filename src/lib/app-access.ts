import { routes } from "@/lib/routes"

const APP_ACCESS_COOKIE_NAME = "kg-workbench-app-access"
const APP_ACCESS_GROUP_COOKIE_NAME = "kg-workbench-app-access-group"
const SHARED_APP_ACCESS_GROUP_KEY = "shared"

interface AppAccessCookieDescriptor {
  name: string
}

export interface AppAccessGroup {
  key: string
  name: string
  password: string
}

export function isAppAccessEnabled(): boolean {
  return process.env.APP_PASSWORD_PROTECTION_ENABLED === "true"
}

export function isAppAccessConfigured(): boolean {
  return getAppAccessGroups().length > 0 || Boolean(process.env.APP_PASSWORD)
}

// Normalize human-readable group names into stable keys used by cookies and DB rows.
export function normalizeAppAccessGroupKey(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export function getAppAccessGroups(): AppAccessGroup[] {
  const rawGroups = process.env.APP_ACCESS_GROUPS

  if (!rawGroups) {
    return []
  }

  return rawGroups
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean)
    .flatMap((entry) => {
      const separatorIndex = entry.indexOf(":")

      if (separatorIndex <= 0 || separatorIndex === entry.length - 1) {
        return []
      }

      const name = entry.slice(0, separatorIndex).trim()
      const password = entry.slice(separatorIndex + 1).trim()

      if (!name || !password) {
        return []
      }

      const key = normalizeAppAccessGroupKey(name)

      if (!key) {
        return []
      }

      return [{ key, name, password }]
    })
}

export function getAppAccessGroup(groupName?: string): AppAccessGroup | null {
  if (!groupName) {
    return null
  }

  return (
    getAppAccessGroups().find(
      (group) => group.name.toLowerCase() === groupName.toLowerCase()
    ) ?? null
  )
}

export function getAppAccessGroupByKey(
  groupKey?: string
): AppAccessGroup | null {
  if (!groupKey) {
    return null
  }

  return getAppAccessGroups().find((group) => group.key === groupKey) ?? null
}

async function hashAppAccessValue(value: string): Promise<string> {
  const bytes = new TextEncoder().encode(value)
  const digest = await crypto.subtle.digest("SHA-256", bytes)
  return Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, "0")
  ).join("")
}

async function buildAppAccessCookieValue(
  groupKey: string,
  password: string
): Promise<string> {
  return hashAppAccessValue(`${groupKey}:${password}`)
}

export async function createAppAccessCookieValue(
  password: string,
  groupName?: string
): Promise<string | null> {
  const groups = getAppAccessGroups()

  if (groups.length > 0) {
    const group = getAppAccessGroup(groupName)
    if (!group || group.password !== password) {
      return null
    }

    return buildAppAccessCookieValue(group.key, group.password)
  }

  const expectedPassword = process.env.APP_PASSWORD

  if (!expectedPassword || password !== expectedPassword) {
    return null
  }

  return buildAppAccessCookieValue(
    SHARED_APP_ACCESS_GROUP_KEY,
    expectedPassword
  )
}

export async function isAppAccessPasswordValid(
  password: string,
  groupName?: string
): Promise<boolean> {
  return (await createAppAccessCookieValue(password, groupName)) !== null
}

export function getAppAccessCookie(): AppAccessCookieDescriptor {
  return {
    name: APP_ACCESS_COOKIE_NAME,
  }
}

export function getAppAccessGroupCookie(): AppAccessCookieDescriptor {
  return {
    name: APP_ACCESS_GROUP_COOKIE_NAME,
  }
}

export async function hasAppAccess(
  cookieValue?: string,
  groupCookieValue?: string
): Promise<boolean> {
  if (!cookieValue) {
    return false
  }

  const groups = getAppAccessGroups()

  if (groups.length === 0) {
    const expectedPassword = process.env.APP_PASSWORD
    if (!expectedPassword) {
      return false
    }

    return (
      cookieValue ===
      (await buildAppAccessCookieValue(
        SHARED_APP_ACCESS_GROUP_KEY,
        expectedPassword
      ))
    )
  }

  const group = getAppAccessGroupByKey(groupCookieValue)
  if (!group) {
    return false
  }

  return (
    cookieValue === (await buildAppAccessCookieValue(group.key, group.password))
  )
}

// Unprotected installations use the shared workspace; protected groups require valid cookies.
export async function getCurrentAppAccessGroup(
  cookieValue?: string,
  groupCookieValue?: string
): Promise<AppAccessGroup | null> {
  if (!isAppAccessEnabled()) {
    return {
      key: SHARED_APP_ACCESS_GROUP_KEY,
      name: "Shared",
      password: "",
    }
  }

  const groups = getAppAccessGroups()

  if (groups.length === 0) {
    const hasAccess = await hasAppAccess(cookieValue, groupCookieValue)
    return hasAccess
      ? {
          key: SHARED_APP_ACCESS_GROUP_KEY,
          name: "Shared",
          password: process.env.APP_PASSWORD ?? "",
        }
      : null
  }

  const group = getAppAccessGroupByKey(groupCookieValue)
  if (!group) {
    return null
  }

  return (await hasAppAccess(cookieValue, group.key)) ? group : null
}

// Keep redirects on known in-app routes and avoid bouncing back to the access page.
export function resolveAppAccessNextPath(nextPath?: string): string {
  if (!nextPath || !nextPath.startsWith("/") || nextPath.startsWith("//")) {
    return routes.ontology.root
  }

  if (nextPath === routes.access.root) {
    return routes.ontology.root
  }

  return nextPath
}
