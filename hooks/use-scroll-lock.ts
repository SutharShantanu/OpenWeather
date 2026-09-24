"use client"

import { useEffect } from "react"
import { useLenis } from "@/components/lenis-provider"

// Shared across every caller: the page only unlocks once no dialog/popover still needs the lock
let lockCount = 0
let savedStyles: { bodyOverflow: string; htmlOverflow: string; bodyPaddingRight: string } | null = null

function acquire() {
  lockCount++
  if (lockCount > 1) return

  const { body, documentElement: html } = document
  savedStyles = {
    bodyOverflow: body.style.overflow,
    htmlOverflow: html.style.overflow,
    bodyPaddingRight: body.style.paddingRight,
  }
  // Keep layout stable when the scrollbar disappears
  const scrollbarWidth = window.innerWidth - html.clientWidth
  if (scrollbarWidth > 0) {
    body.style.paddingRight = `${scrollbarWidth}px`
  }
  body.style.overflow = "hidden"
  html.style.overflow = "hidden"
}

function release() {
  lockCount = Math.max(0, lockCount - 1)
  if (lockCount > 0 || !savedStyles) return

  const { body, documentElement: html } = document
  body.style.overflow = savedStyles.bodyOverflow
  html.style.overflow = savedStyles.htmlOverflow
  body.style.paddingRight = savedStyles.bodyPaddingRight
  savedStyles = null
}

/**
 * Locks Lenis smooth scroll and viewport scrolling while `isLocked` is true.
 * Safe to use from several components at once (dialogs, search popover, ...).
 */
export function useScrollLock(isLocked: boolean) {
  const lenis = useLenis()

  useEffect(() => {
    if (!isLocked) return

    acquire()
    lenis?.stop()

    return () => {
      release()
      if (lockCount === 0) lenis?.start()
    }
  }, [isLocked, lenis])
}
