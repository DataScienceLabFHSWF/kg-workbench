import assert from "node:assert/strict"
import { afterEach, beforeEach, test } from "node:test"

import {
  createAppAccessCookieValue,
  getCurrentAppAccessGroup,
} from "../src/lib/app-access"

const envKeys = [
  "APP_PASSWORD_PROTECTION_ENABLED",
  "APP_PASSWORD",
  "APP_ACCESS_GROUPS",
] as const
let originalEnv: Partial<Record<(typeof envKeys)[number], string>>

beforeEach(() => {
  originalEnv = {}
  for (const key of envKeys) {
    originalEnv[key] = process.env[key]
    delete process.env[key]
  }
})

afterEach(() => {
  for (const key of envKeys) {
    const value = originalEnv[key]
    if (value === undefined) delete process.env[key]
    else process.env[key] = value
  }
})

test("a fresh unprotected installation can access the shared workspace", async () => {
  process.env.APP_PASSWORD_PROTECTION_ENABLED = "false"
  const group = await getCurrentAppAccessGroup()
  assert.equal(group?.key, "shared")
  assert.equal(group?.password, "")
})

test("disabled protection never selects a private group from stale cookies", async () => {
  process.env.APP_PASSWORD_PROTECTION_ENABLED = "false"
  process.env.APP_ACCESS_GROUPS = "Private Group:test-group-password"
  const cookie = await createAppAccessCookieValue(
    "test-group-password",
    "Private Group"
  )
  assert.ok(cookie)
  const group = await getCurrentAppAccessGroup(cookie, "private-group")
  assert.equal(group?.key, "shared")
})

test("protected shared access rejects missing or invalid cookies", async () => {
  process.env.APP_PASSWORD_PROTECTION_ENABLED = "true"
  process.env.APP_PASSWORD = "test-shared-password"
  assert.equal(await getCurrentAppAccessGroup(), null)
  assert.equal(await getCurrentAppAccessGroup("invalid-cookie"), null)
  assert.equal(await createAppAccessCookieValue("wrong-password"), null)
})

test("a valid shared password opens the same workspace as local seed data", async () => {
  process.env.APP_PASSWORD_PROTECTION_ENABLED = "true"
  process.env.APP_PASSWORD = "test-shared-password"
  const cookie = await createAppAccessCookieValue("test-shared-password")
  assert.ok(cookie)
  assert.equal((await getCurrentAppAccessGroup(cookie))?.key, "shared")
})

test("protected groups require matching cookies and stay isolated", async () => {
  process.env.APP_PASSWORD_PROTECTION_ENABLED = "true"
  process.env.APP_ACCESS_GROUPS = "Team A:test-alpha,Team B:test-beta"
  const cookie = await createAppAccessCookieValue("test-alpha", "Team A")
  assert.ok(cookie)
  assert.equal(
    (await getCurrentAppAccessGroup(cookie, "team-a"))?.key,
    "team-a"
  )
  assert.equal(await getCurrentAppAccessGroup(cookie, "team-b"), null)
  assert.equal(await getCurrentAppAccessGroup(cookie), null)
  assert.equal(await getCurrentAppAccessGroup(undefined, "team-a"), null)
})

test("enabling protection without credentials fails closed", async () => {
  process.env.APP_PASSWORD_PROTECTION_ENABLED = "true"
  assert.equal(await getCurrentAppAccessGroup(), null)
  assert.equal(await getCurrentAppAccessGroup("invalid-cookie"), null)
})
