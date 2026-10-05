"use client"

import { useEffect, useRef } from "react"

export function MSWProvider({ children }: { children: React.ReactNode }) {
  const initialized = useRef(false)

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true

    if (process.env.NEXT_PUBLIC_USE_MOCKS !== "true") return

    import("@/mocks/browser").then(({ worker }) => {
      worker.start({ onUnhandledRequest: "bypass" })
    })
  }, [])

  return <>{children}</>
}
