"use client"

// Replaces the root layout when it fails, so it cannot rely on app styles.
export default function GlobalError({
  retry,
  reset,
}: {
  error: Error & { digest?: string }
  retry?: () => void
  reset?: () => void
}) {
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
    <html lang="en">
      <body
        style={{
          fontFamily: "system-ui, sans-serif",
          display: "grid",
          placeItems: "center",
          minHeight: "100vh",
          margin: 0,
        }}
      >
        <main role="alert" style={{ textAlign: "center", padding: 16 }}>
          <title>Something went wrong</title>
          <h1 style={{ fontSize: 20 }}>Something went wrong</h1>
          <p>The app failed to load. Please try again.</p>
          <button type="button" onClick={handleRetry}>
            Try again
          </button>
        </main>
      </body>
    </html>
  )
}
