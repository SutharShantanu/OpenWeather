"use client"

import { useEffect } from "react"
import { CloudOff, RefreshCw } from "lucide-react"
import { EmptyState } from "@/components/empty-state"

export default function Error({
  error,
  retry,
  reset,
}: {
  error: Error & { digest?: string }
  retry?: () => void
  reset?: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  const handleRetry = () => {
    if (typeof retry === "function") {
      retry()
    } else if (typeof reset === "function") {
      reset()
    } else if (typeof window !== "undefined") {
      window.location.reload()
    }
  }

  return (
    <main className="mx-auto flex min-h-svh w-full max-w-xl items-center px-4">
      <EmptyState
        role="alert"
        icon={CloudOff}
        title="Something went wrong"
        description="The dashboard hit an unexpected error. Try again, or reload the page."
        primaryAction={{
          label: "Try again",
          icon: RefreshCw,
          onClick: handleRetry,
        }}
      />
    </main>
  )
}
