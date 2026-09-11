import { useMemo, useState } from "react"

export interface UseBooleanActions {
  /** Set state to true */
  setTrue: () => void
  /** Set state to false */
  setFalse: () => void
  /** Set state to a specific boolean value */
  set: (value: boolean) => void
  /** Toggle boolean state */
  toggle: () => void
}

/**
 * A hook to manage and toggle a boolean value with memoized actions.
 *
 * @param defaultValue - Initial boolean state (default: false)
 * @returns A tuple of `[state, actions]` where actions contains `{ setTrue, setFalse, set, toggle }`
 *
 * @see https://shadcn-hooks.com/docs/hooks/use-boolean
 */
export function useBoolean(
  defaultValue: boolean = false
): [boolean, UseBooleanActions] {
  const [state, setState] = useState(defaultValue)

  const actions = useMemo(
    () => ({
      setTrue: () => setState(true),
      setFalse: () => setState(false),
      set: (value: boolean) => setState(value),
      toggle: () => setState((v) => !v),
    }),
    []
  )

  return [state, actions]
}
