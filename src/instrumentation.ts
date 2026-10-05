export async function register() {
  if (
    process.env.NEXT_PUBLIC_USE_MOCKS !== "true" ||
    process.env.NEXT_RUNTIME !== "nodejs"
  ) {
    return
  }

  const { server } = await import("@/mocks/server")
  server.listen({ onUnhandledRequest: "bypass" })
}
