import type { CSSProperties, ElementType } from "react"
import { cn } from "@/lib/utils"

/**
 * Text with a light sweep passing over it, for "thinking/typing" states.
 * Adapted from Vercel AI Elements' Shimmer (@ai-elements/shimmer), using a CSS
 * keyframe instead of the `motion` library. Static under reduced motion.
 */
export function Shimmer({
  children,
  as: Component = "span",
  className,
  duration = 2,
  spread = 2,
}: {
  children: string
  as?: ElementType
  className?: string
  /** Seconds per sweep. */
  duration?: number
  /** Highlight width per character, in px. */
  spread?: number
}) {
  return (
    <Component
      className={cn(
        "relative inline-block animate-shimmer bg-size-[250%_100%,auto] bg-clip-text text-transparent [background-repeat:no-repeat,padding-box] motion-reduce:animate-none",
        className
      )}
      style={
        {
          "--spread": `${children.length * spread}px`,
          animationDuration: `${duration}s`,
          backgroundImage:
            "linear-gradient(90deg, #0000 calc(50% - var(--spread)), var(--color-background), #0000 calc(50% + var(--spread))), linear-gradient(var(--color-muted-foreground), var(--color-muted-foreground))",
        } as CSSProperties
      }
    >
      {children}
    </Component>
  )
}
