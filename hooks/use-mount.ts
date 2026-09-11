import { useEffect, useSyncExternalStore } from "react"
import type { EffectCallback } from "react"

type MountCallback = EffectCallback | (() => Promise<void | (() => void)>)

export function useMount(fn: MountCallback) {
  useEffect(() => {
    const result = fn?.()
    // If fn returns a Promise, don't return it as cleanup function
    if (
      result &&
      typeof result === "object" &&
      "then" in result &&
      typeof (result as PromiseLike<unknown>).then === "function"
    ) {
      return
    }

    return result as ReturnType<EffectCallback>
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}

const emptySubscribe = () => () => {}

/**
 * Returns true if the component has mounted on the client, false during SSR.
 * Uses useSyncExternalStore to avoid hydration mismatch without triggering
 * cascading renders or violating `react-hooks/set-state-in-effect`.
 */
export function useMounted(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  )
}
