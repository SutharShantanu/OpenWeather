import { useEffect, useLayoutEffect, useRef } from "react"

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect

/**
 * A hook that returns a ref that always holds the latest value passed to it.
 * Updates the ref in layout phase to be safe with React 19 render-phase rules.
 * @param value - The value to store in the ref
 * @returns Ref object with the latest value
 */
export function useLatest<T>(value: T) {
  const ref = useRef(value)

  useIsomorphicLayoutEffect(() => {
    ref.current = value
  })

  return ref
}
