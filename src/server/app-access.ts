"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"

import {
  createAppAccessCookieValue,
  getAppAccessCookie,
  getAppAccessGroup,
  getAppAccessGroupCookie,
  getAppAccessGroups,
  isAppAccessPasswordValid,
  resolveAppAccessNextPath,
} from "@/lib/app-access"
import { routes } from "@/lib/routes"

// Handle the access form on the server so cookie writes and redirects stay out of the page component.
export async function unlockApp(formData: FormData): Promise<void> {
  const groupName = formData.get("group")
  const password = formData.get("password")
  const nextPath = formData.get("next")
  const normalizedGroupName =
    typeof groupName === "string"
      ? getAppAccessGroup(groupName)?.name
      : undefined

  if (
    typeof password !== "string" ||
    !(await isAppAccessPasswordValid(password, normalizedGroupName))
  ) {
    const redirectNextPath = resolveAppAccessNextPath(
      typeof nextPath === "string" ? nextPath : undefined
    )
    const redirectGroup =
      typeof groupName === "string"
        ? getAppAccessGroup(groupName)?.name
        : undefined

    redirect(
      `${routes.access.root}?error=invalid&next=${encodeURIComponent(redirectNextPath)}${
        redirectGroup ? `&group=${encodeURIComponent(redirectGroup)}` : ""
      }`
    )
  }

  const cookieStore = await cookies()
  const accessCookieValue = await createAppAccessCookieValue(
    password,
    normalizedGroupName
  )

  if (!accessCookieValue) {
    redirect(routes.access.root)
  }

  const accessCookie = getAppAccessCookie()
  const groupCookie = getAppAccessGroupCookie()

  cookieStore.set({
    name: accessCookie.name,
    value: accessCookieValue,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  })

  if (getAppAccessGroups().length > 0 && normalizedGroupName) {
    cookieStore.set({
      name: groupCookie.name,
      value: getAppAccessGroup(normalizedGroupName)?.key ?? "",
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
    })
  } else {
    cookieStore.delete(groupCookie.name)
  }

  redirect(
    resolveAppAccessNextPath(
      typeof nextPath === "string" ? nextPath : undefined
    )
  )
}
