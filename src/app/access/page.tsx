import { cookies } from "next/headers"
import { redirect } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  getAppAccessCookie,
  getAppAccessGroup,
  getAppAccessGroupCookie,
  getAppAccessGroups,
  hasAppAccess,
  isAppAccessConfigured,
  isAppAccessEnabled,
  resolveAppAccessNextPath,
} from "@/lib/app-access"
import { routes } from "@/lib/routes"
import { unlockApp } from "@/server/app-access"

interface AccessPageProps {
  searchParams: Promise<{
    error?: string
    group?: string
    next?: string
  }>
}

export default async function AccessPage({ searchParams }: AccessPageProps) {
  const { error, group, next } = await searchParams
  const cookieStore = await cookies()
  const { name } = getAppAccessCookie()
  const groupCookie = getAppAccessGroupCookie()
  const groups = getAppAccessGroups()
  const selectedGroup = getAppAccessGroup(group)?.name ?? ""

  if (!isAppAccessEnabled()) {
    redirect(routes.ontology.root)
  }

  if (
    await hasAppAccess(
      cookieStore.get(name)?.value,
      cookieStore.get(groupCookie.name)?.value
    )
  ) {
    redirect(resolveAppAccessNextPath(next))
  }

  const isConfigured = isAppAccessConfigured()
  const isGroupMode = groups.length > 0

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/20 px-4 py-10">
      <div className="w-full max-w-sm border border-border bg-background p-6 shadow-sm">
        <div className="space-y-2">
          <p className="text-xs font-medium tracking-[0.2em] text-muted-foreground uppercase">
            Protected Access
          </p>
          <h1 className="font-heading text-2xl">
            {isGroupMode ? "Choose group and enter password" : "Enter password"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isGroupMode
              ? "Select your group, then enter the matching shared password."
              : "This app is currently protected by a shared password."}
          </p>
        </div>

        {!isConfigured ? (
          <p className="mt-6 border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
            Password protection is enabled, but neither `APP_ACCESS_GROUPS` nor
            `APP_PASSWORD` is configured correctly.
          </p>
        ) : null}

        {error === "invalid" ? (
          <p className="mt-6 border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
            Wrong password. Try again.
          </p>
        ) : null}

        <form action={unlockApp} className="mt-6 space-y-4">
          <input
            type="hidden"
            name="next"
            value={resolveAppAccessNextPath(next)}
          />
          {isGroupMode ? (
            <div className="space-y-2">
              <Label htmlFor="group">Group</Label>
              <select
                id="group"
                name="group"
                defaultValue={selectedGroup}
                disabled={!isConfigured}
                required
                className="flex h-9 w-full rounded-none border border-input bg-transparent px-3 py-2 text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Select group</option>
                {groups.map((accessGroup) => (
                  <option key={accessGroup.name} value={accessGroup.name}>
                    {accessGroup.name}
                  </option>
                ))}
              </select>
            </div>
          ) : null}
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              disabled={!isConfigured}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={!isConfigured}>
            Enter app
          </Button>
        </form>
      </div>
    </div>
  )
}
