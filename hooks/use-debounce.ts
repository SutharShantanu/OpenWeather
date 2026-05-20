"use client";

import { useEffect, useState } from "react";

export interface DebounceOptions {
  /**
   * An optional AbortSignal to cancel the debounced function.
   */
  signal?: AbortSignal;
  /**
   * An optional array specifying whether the function should be invoked on the leading edge, trailing edge, or both.
   * If `edges` includes "leading", the function will be invoked at the start of the delay period.
   * If `edges` includes "trailing", the function will be invoked at the end of the delay period.
   * If both "leading" and "trailing" are included, the function will be invoked at both the start and end of the delay period.
   * @default ["trailing"]
   */
  edges?: Array<"leading" | "trailing">;
}

/**
 * A hook to debounce a value
 * @param value - The value to debounce
 * @param debounceMs - The debounce time in milliseconds default to 1000
 * @param options - The options for the debounce value
 * @returns The debounced value
 */
export function useDebounce<T>(
  value: T,
  debounceMs: number = 1000,
  options?: DebounceOptions
): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    if (options?.signal?.aborted) return;

    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, debounceMs);

    return () => {
      clearTimeout(handler);
    };
  }, [value, debounceMs, options?.signal]);

  return debouncedValue;
}
