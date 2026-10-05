import { NextResponse, type NextRequest } from "next/server"

import {
  getAppAccessCookie,
  getAppAccessGroupCookie,
  hasAppAccess,
  isAppAccessEnabled,
  resolveAppAccessNextPath,
} from "@/lib/app-access"
import { routes } from "@/lib/routes"

function isPublicAsset(pathname: string): boolean {
  return pathname.includes(".")
}

export async function proxy(request: NextRequest): Promise<NextResponse> {
  if (!isAppAccessEnabled()) {
    return NextResponse.next()
  }

  const { pathname, search } = request.nextUrl

  if (
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico" ||
    isPublicAsset(pathname)
  ) {
    return NextResponse.next()
  }

  const hasAccess = await hasAppAccess(
    request.cookies.get(getAppAccessCookie().name)?.value,
    request.cookies.get(getAppAccessGroupCookie().name)?.value
  )

  if (pathname === routes.access.root) {
    // Once access is granted, never leave the user sitting on the unlock page.
    if (!hasAccess) {
      return NextResponse.next()
    }

    const nextPath = resolveAppAccessNextPath(
      request.nextUrl.searchParams.get("next") ?? undefined
    )
    return NextResponse.redirect(new URL(nextPath, request.url))
  }

  if (hasAccess) {
    return NextResponse.next()
  }

  const accessUrl = new URL(routes.access.root, request.url)
  accessUrl.searchParams.set("next", `${pathname}${search}`)
  return NextResponse.redirect(accessUrl)
}

export const config = {
  matcher: ["/:path*"],
}
