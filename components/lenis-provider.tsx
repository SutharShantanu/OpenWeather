"use client";

import React from "react";
import { ReactLenis, useLenis } from "lenis/react";

export { useLenis };

export function LenisProvider({ children }: { children: React.ReactNode }) {
  return (
    <ReactLenis
      root
      options={{
        lerp: 0.1,
        duration: 1.2,
        smoothWheel: true,
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
