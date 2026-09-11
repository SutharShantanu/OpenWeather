import { useEffect } from "react"
import { useLatest } from "@/hooks/use-latest"

/**
 * A hook to run a function when the component unmounts
 * @param fn - The function to run when the component unmounts
 */
export function useUnmount(fn: () => void): void {
  const fnRef = useLatest(fn)

  useEffect(
    () => () => {
      fnRef.current?.()
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )
}
