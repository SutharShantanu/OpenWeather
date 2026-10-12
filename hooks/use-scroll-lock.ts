"use client"

import { useEffect } from "react"
import { useLenis } from "@/components/lenis-provider"

// Shared across every caller: the page only unlocks once no dialog/popover still needs the lock
let lockCount = 0
let savedStyles: { htmlOverflow: string } | null = null

function acquire() {
  lockCount++
  if (lockCount > 1) return

  const html = document.documentElement
  savedStyles = {
    htmlOverflow: html.style.overflow,
  }
  // No scrollbar compensation needed: html reserves its gutter (scrollbar-gutter: stable in globals.css)
  // html only: with overflow hidden on both, body becomes its own scroll
  // container and the sticky header scrolls out of view.
  html.style.overflow = "hidden"
}

function release() {
  lockCount = Math.max(0, lockCount - 1)
  if (lockCount > 0 || !savedStyles) return

  document.documentElement.style.overflow = savedStyles.htmlOverflow
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
