"use client";

import React, { useEffect } from "react";
import { ReactLenis, useLenis } from "lenis/react";
import { useMediaQuery } from "@/hooks/use-media-query";

export { useLenis };

function LenisResizeSync() {
  const lenis = useLenis();

  useEffect(() => {
    if (!lenis || typeof window === "undefined" || typeof ResizeObserver === "undefined") return;

    // Observe document.body so Lenis recalculates its dimensions whenever dynamic cards render or expand
    const ro = new ResizeObserver(() => {
      lenis.resize();
    });

    if (document.body) {
      ro.observe(document.body);
    }

    return () => ro.disconnect();
  }, [lenis]);

  return null;
}

export function LenisProvider({ children }: { children: React.ReactNode }) {
  // Smooth-scroll inertia is motion; respect the OS "reduce motion" setting.
  // Options (not an unmount) so toggling the setting doesn't remount the app.
  const reduceMotion = useMediaQuery("(prefers-reduced-motion: reduce)");

  return (
    <ReactLenis
      root
      options={{
        lerp: reduceMotion ? 1 : 0.1,
        duration: reduceMotion ? 0 : 1.2,
        smoothWheel: !reduceMotion,
        naiveDimensions: true,
        prevent: (node) => {
          if (typeof document === "undefined") return false;
          return (
            (node as HTMLElement)?.closest?.("[data-lenis-prevent]") !== null ||
            (node as HTMLElement)?.closest?.("[role='dialog']") !== null ||
            (node as HTMLElement)?.closest?.("[data-slot='dialog-content']") !== null ||
            document.body.hasAttribute("data-scroll-locked") ||
            document.body.style.overflow === "hidden" ||
            document.documentElement.style.overflow === "hidden"
          );
        },
      }}
    >
      <LenisResizeSync />
      {children}
    </ReactLenis>
  );
}
