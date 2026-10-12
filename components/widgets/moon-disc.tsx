import { useId } from "react"
import { cn } from "@/lib/utils"

interface MoonDiscProps {
  /** Phase 0..1: 0 new, 0.25 first quarter, 0.5 full, 0.75 last quarter. */
  phase: number
  /** Mirror the disc, as the moon appears from the southern hemisphere. */
  flip?: boolean
  className?: string
}

/** Moon disc with the lit part drawn on the correct side (northern-hemisphere view unless `flip`). */
export function MoonDisc({ phase, flip = false, className }: MoonDiscProps) {
  const r = 24
  const c = 28
  const k = Math.cos(phase * 2 * Math.PI) // 1 new .. -1 full
  const rx = Math.abs(k) * r
  const lit = `M ${c} ${c - r} A ${r} ${r} 0 0 1 ${c} ${c + r} A ${rx} ${r} 0 0 ${k > 0 ? 0 : 1} ${c} ${c - r} Z`
  // Waxing is lit on the right; waning on the left. The southern view swaps them.
  const mirrored = phase > 0.5 !== flip
  const uid = useId().replace(/:/g, "")
  const litTransform = mirrored
    ? `translate(${2 * c} 0) scale(-1 1)`
    : undefined
  // Fixed lunar surface: dark maria and craters, drawn as shaded patches.
  const surface = (
    <g>
      <ellipse cx="20" cy="22" rx="9" ry="7" />
      <ellipse cx="33" cy="17" rx="6" ry="5" />
      <ellipse cx="36" cy="30" rx="8" ry="6" />
      <ellipse cx="26" cy="37" rx="5" ry="4" />
      <circle cx="40" cy="41" r="3.2" />
      <circle cx="15" cy="35" r="2.6" />
      <circle cx="22" cy="46" r="2" />
      <circle cx="43" cy="22" r="2" />
      <circle cx="30" cy="27" r="1.6" />
    </g>
  )
  return (
    <svg
      viewBox="0 0 56 56"
      className={cn("size-14 shrink-0", className)}
      aria-hidden
    >
      <defs>
        <clipPath id={`${uid}-disc`}>
          <circle cx={c} cy={c} r={r} />
        </clipPath>
        <clipPath id={`${uid}-lit`}>
          <path d={lit} transform={litTransform} />
        </clipPath>
        <radialGradient id={`${uid}-glow`} cx="38%" cy="35%" r="75%">
          <stop offset="0%" stopColor="#f4f1e6" />
          <stop offset="60%" stopColor="#d4d0c2" />
          <stop offset="100%" stopColor="#a9a595" />
        </radialGradient>
      </defs>
      {/* Night side: dim body with earthshine-faint surface detail */}
      <circle cx={c} cy={c} r={r} className="fill-muted" />
      <g clipPath={`url(#${uid}-disc)`} className="fill-foreground/10">
        {surface}
      </g>
      {/* Lit side: shaded sphere with the surface darkening the maria */}
      <path d={lit} transform={litTransform} fill={`url(#${uid}-glow)`} />
      <g clipPath={`url(#${uid}-lit)`} fill="#6f6b5d" fillOpacity="0.32">
        {surface}
      </g>
      <circle cx={c} cy={c} r={r} fill="none" className="stroke-border" />
    </svg>
  )
}
