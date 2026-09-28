"use client"

import * as React from "react"

export interface UseCopyToClipboardOptions {
  /**
   * Duration in milliseconds before resetting `isCopied` back to false.
   * @default 2000
   */
  timeout?: number
  /**
   * Optional callback invoked when copying succeeds.
   */
  onCopy?: (copiedText: string) => void
  /**
   * Optional callback invoked when copying fails.
   */
  onError?: (error: Error) => void
}

export interface UseCopyToClipboardReturn {
  /**
   * Whether text was recently copied and timeout hasn't elapsed.
   */
  isCopied: boolean
  /**
   * The text that was copied, or null if none.
   */
  copiedText: string | null
  /**
   * Function to copy text or string-resolving Promise to the clipboard.
   */
  copyToClipboard: (text: string | Promise<string>) => Promise<boolean>
}

/**
 * Hook to copy text to the user's clipboard with auto-resetting feedback state.
 *
 * @param options - Configuration options for timeout and callbacks
 * @returns `{ isCopied, copyToClipboard, copiedText }`
 */
export function useCopyToClipboard({
  timeout = 2000,
  onCopy,
  onError,
}: UseCopyToClipboardOptions = {}): UseCopyToClipboardReturn {
  const [isCopied, setIsCopied] = React.useState(false)
  const [copiedText, setCopiedText] = React.useState<string | null>(null)
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  const copyToClipboard = React.useCallback(
    async (textOrPromise: string | Promise<string>): Promise<boolean> => {
      if (typeof window === "undefined") return false

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }

      try {
        const text =
          typeof textOrPromise === "string"
            ? textOrPromise
            : await textOrPromise

        if (navigator?.clipboard?.writeText) {
          await navigator.clipboard.writeText(text)
        } else {
          // Fallback for older browsers or non-secure contexts
          const textarea = document.createElement("textarea")
          textarea.value = text
          textarea.style.position = "fixed"
          textarea.style.opacity = "0"
          textarea.style.pointerEvents = "none"
          document.body.appendChild(textarea)
          textarea.focus()
          textarea.select()
          document.execCommand("copy")
          document.body.removeChild(textarea)
        }

        setIsCopied(true)
        setCopiedText(text)
        onCopy?.(text)

        timeoutRef.current = setTimeout(() => {
          setIsCopied(false)
          timeoutRef.current = null
        }, timeout)

        return true
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error("Failed to copy to clipboard")
        setIsCopied(false)
        onError?.(error)
        return false
      }
    },
    [timeout, onCopy, onError]
  )

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return { isCopied, copyToClipboard, copiedText }
}
