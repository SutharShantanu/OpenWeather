"use client";

import React from "react";
import { ReactLenis, useLenis } from "lenis/react";
import { useMediaQuery } from "@/hooks/use-media-query";

export { useLenis };

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
      {children}
    </ReactLenis>
  );
}
