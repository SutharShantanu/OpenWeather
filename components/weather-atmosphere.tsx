"use client"

import { useEffect, useRef } from "react"
import { useTheme } from "next-themes"
import { WeatherConditionType } from "@/lib/weather"

interface WeatherAtmosphereProps {
  condition: WeatherConditionType
  isNight?: boolean
  windSpeed?: number // m/s
  className?: string
}

type Draw = (ctx: CanvasRenderingContext2D, t: number, dt: number) => void
type CloudTone = [
  light: string,
  shade: string,
  minAlpha: number,
  maxAlpha: number,
]

const TAU = Math.PI * 2
const rand = (min: number, max: number) => min + Math.random() * (max - min)

/** Colours per theme. Glow layers add light on dark cards, tint on light cards. */
function palette(dark: boolean) {
  return {
    blend: (dark ? "lighter" : "source-over") as GlobalCompositeOperation,
    sunGlow: dark ? "255,190,90" : "251,146,60",
    sunCore: dark ? "255,244,214" : "253,186,116",
    rain: dark ? "190,220,250" : "71,105,145",
    snow: dark ? "240,248,255" : "148,178,210",
    star: dark ? "248,250,252" : "100,116,139",
    moon: dark
      ? ["250,250,240", "180,190,210"]
      : ["226,232,240", "148,163,184"],
    wind: dark ? "153,246,228" : "13,148,136",
    fog: dark ? "203,213,225" : "148,163,184",
    flash: dark ? "200,190,255" : "129,140,248",
    clouds: {
      day: (dark
        ? ["#ffffff", "#cbd5e1", 0.12, 0.2]
        : ["#e2e8f0", "#94a3b8", 0.25, 0.4]) as CloudTone,
      grey: (dark
        ? ["#e2e8f0", "#64748b", 0.12, 0.2]
        : ["#cbd5e1", "#64748b", 0.2, 0.32]) as CloudTone,
      night: (dark
        ? ["#94a3b8", "#334155", 0.14, 0.22]
        : ["#94a3b8", "#475569", 0.18, 0.28]) as CloudTone,
      rain: (dark
        ? ["#94a3b8", "#1e293b", 0.2, 0.32]
        : ["#94a3b8", "#334155", 0.22, 0.34]) as CloudTone,
      storm: (dark
        ? ["#a5a3c9", "#1e1b3a", 0.25, 0.38]
        : ["#a5a3c9", "#312e81", 0.22, 0.34]) as CloudTone,
    },
  }
}
type Palette = ReturnType<typeof palette>

function offscreen(w: number, h: number) {
  const c = document.createElement("canvas")
  c.width = Math.ceil(w)
  c.height = Math.ceil(h)
  return [c, c.getContext("2d")!] as const
}

/** Soft round blob, reused for snowflakes and fog banks. */
function softDot(size: number, rgb: string) {
  const [c, g] = offscreen(size, size)
  const r = size / 2
  const grad = g.createRadialGradient(r, r, 0, r, r, r)
  grad.addColorStop(0, `rgba(${rgb},1)`)
  grad.addColorStop(0.4, `rgba(${rgb},0.5)`)
  grad.addColorStop(1, `rgba(${rgb},0)`)
  g.fillStyle = grad
  g.fillRect(0, 0, size, size)
  return c
}

/** Cumulus sprite: overlapping puffs on a flat base, blurred, lit from above. */
function cloudSprite(w: number, h: number, light: string, shade: string) {
  const blur = h * 0.12
  const pad = blur * 2.5
  const [c, g] = offscreen(w + pad * 2, h + pad * 2)
  g.filter = `blur(${blur}px)`
  const grad = g.createLinearGradient(0, pad, 0, pad + h)
  grad.addColorStop(0, light)
  grad.addColorStop(1, shade)
  g.fillStyle = grad
  g.beginPath()
  const n = 5 + Math.floor(Math.random() * 3)
  for (let i = 0; i < n; i++) {
    const r =
      h * (0.18 + 0.27 * Math.sin((Math.PI * (i + 0.5)) / n)) * rand(0.85, 1.1)
    const x = pad + w * (0.12 + (0.76 * i) / (n - 1) + rand(-0.03, 0.03))
    const y = pad + h * 0.92 - r
    g.moveTo(x + r, y)
    g.arc(x, y, r, 0, TAU)
  }
  g.rect(pad + w * 0.1, pad + h * 0.55, w * 0.8, h * 0.37)
  g.fill()
  return c
}

function makeClouds(
  w: number,
  h: number,
  count: number,
  tone: CloudTone,
  windSpeed: number,
  yMax = 0.45
): Draw {
  const [light, shade, minA, maxA] = tone
  // Far clouds first: smaller, slower, fainter (parallax).
  const clouds = Array.from({ length: count }, (_, i) => {
    const depth = count > 1 ? i / (count - 1) : 1
    const cw = rand(0.22, 0.34) * w * (0.7 + depth * 0.6)
    const img = cloudSprite(cw, cw * rand(0.32, 0.42), light, shade)
    return {
      img,
      x: rand(-img.width, w),
      y: rand(-0.1, yMax) * h - img.height * 0.3,
      speed: (6 + depth * 14) * (1 + windSpeed * 0.08),
      alpha: rand(minA, maxA) * (0.6 + depth * 0.4),
    }
  })
  return (ctx, _t, dt) => {
    for (const c of clouds) {
      c.x += c.speed * dt
      if (c.x > w) c.x = -c.img.width
      ctx.globalAlpha = c.alpha
      ctx.drawImage(c.img, c.x, c.y)
    }
    ctx.globalAlpha = 1
  }
}

const FLARES = [
  { d: 0.45, r: 10, a: 0.1 },
  { d: 0.75, r: 26, a: 0.05 },
  { d: 1.05, r: 6, a: 0.12 },
  { d: 1.35, r: 40, a: 0.04 },
]

function makeSun(w: number, h: number, p: Palette, strength: number): Draw {
  const cx = w * 0.84
  const cy = h * 0.2
  const reach = Math.max(w, h) * 0.75
  const rays = Array.from({ length: 18 }, (_, i) => ({
    a: (i / 18) * TAU + rand(-0.1, 0.1),
    width: rand(0.015, 0.06),
    len: rand(0.45, 1) * reach,
    f: rand(0.2, 0.6),
    p: rand(0, TAU),
    alpha: rand(0.03, 0.08),
  }))
  const motes = Array.from({ length: 40 }, () => ({
    x: rand(0, w),
    y: rand(0, h),
    r: rand(0.6, 1.8),
    vx: rand(-4, 4),
    vy: rand(-8, -2),
    p: rand(0, TAU),
  }))

  return (ctx, t, dt) => {
    ctx.save()
    ctx.globalCompositeOperation = p.blend
    const breathe = 1 + 0.05 * Math.sin(t * 0.7)

    // Wide atmospheric haze
    let g = ctx.createRadialGradient(cx, cy, 0, cx, cy, reach * breathe)
    g.addColorStop(0, `rgba(${p.sunGlow},${0.18 * strength})`)
    g.addColorStop(0.3, `rgba(${p.sunGlow},${0.06 * strength})`)
    g.addColorStop(1, `rgba(${p.sunGlow},0)`)
    ctx.fillStyle = g
    ctx.fillRect(0, 0, w, h)

    // Slowly turning, shimmering crepuscular rays
    g = ctx.createRadialGradient(cx, cy, 0, cx, cy, reach)
    g.addColorStop(0, `rgba(${p.sunCore},1)`)
    g.addColorStop(0.15, `rgba(${p.sunCore},0.6)`)
    g.addColorStop(1, `rgba(${p.sunCore},0)`)
    ctx.fillStyle = g
    const spin = t * 0.015
    for (const r of rays) {
      const a = r.a + spin
      const len = r.len * (0.85 + 0.15 * Math.sin(t * r.f + r.p))
      ctx.globalAlpha =
        r.alpha * strength * (0.7 + 0.3 * Math.sin(t * r.f * 1.7 + r.p))
      ctx.beginPath()
      ctx.moveTo(cx, cy)
      ctx.arc(cx, cy, len, a - r.width / 2, a + r.width / 2)
      ctx.closePath()
      ctx.fill()
    }
    ctx.globalAlpha = 1

    // Hot core
    const coreR = 70 * breathe
    g = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreR)
    g.addColorStop(0, `rgba(255,253,240,${0.95 * strength})`)
    g.addColorStop(0.18, `rgba(${p.sunCore},${0.7 * strength})`)
    g.addColorStop(0.4, `rgba(${p.sunGlow},${0.2 * strength})`)
    g.addColorStop(1, `rgba(${p.sunGlow},0)`)
    ctx.fillStyle = g
    ctx.beginPath()
    ctx.arc(cx, cy, coreR, 0, TAU)
    ctx.fill()

    // Lens-flare ghosts along the axis through the card centre
    const dx = w * 0.5 - cx
    const dy = h * 0.6 - cy
    for (const f of FLARES) {
      const fx = cx + dx * f.d
      const fy = cy + dy * f.d
      g = ctx.createRadialGradient(fx, fy, 0, fx, fy, f.r)
      g.addColorStop(0, `rgba(${p.sunCore},${f.a * strength})`)
      g.addColorStop(0.7, `rgba(${p.sunGlow},${f.a * 0.6 * strength})`)
      g.addColorStop(1, `rgba(${p.sunGlow},0)`)
      ctx.fillStyle = g
      ctx.beginPath()
      ctx.arc(fx, fy, f.r, 0, TAU)
      ctx.fill()
    }

    // Dust motes catching the light, brighter near the sun
    for (const m of motes) {
      m.x += m.vx * dt
      m.y += m.vy * dt
      if (m.y < -4) m.y = h + 4
      if (m.x < -4) m.x = w + 4
      if (m.x > w + 4) m.x = -4
      const near = Math.max(0, 1 - Math.hypot(m.x - cx, m.y - cy) / reach)
      const a = near * (0.5 + 0.5 * Math.sin(t * 1.5 + m.p)) * 0.6 * strength
      if (a < 0.01) continue
      ctx.fillStyle = `rgba(${p.sunCore},${a})`
      ctx.beginPath()
      ctx.arc(m.x, m.y, m.r, 0, TAU)
      ctx.fill()
    }
    ctx.restore()
  }
}

function makeMoon(w: number, h: number, p: Palette): Draw {
  const cx = w * 0.84
  const cy = h * 0.22
  const r = 18
  const craters = [
    [-0.3, -0.2, 0.22],
    [0.25, 0.15, 0.16],
    [-0.05, 0.4, 0.12],
  ]
  return (ctx, t) => {
    ctx.save()
    const halo = r * (7 + 0.4 * Math.sin(t * 0.5))
    let g = ctx.createRadialGradient(cx, cy, r, cx, cy, halo)
    g.addColorStop(0, "rgba(200,215,255,0.18)")
    g.addColorStop(1, "rgba(200,215,255,0)")
    ctx.fillStyle = g
    ctx.beginPath()
    ctx.arc(cx, cy, halo, 0, TAU)
    ctx.fill()

    g = ctx.createRadialGradient(cx - r * 0.35, cy - r * 0.35, 0, cx, cy, r)
    g.addColorStop(0, `rgba(${p.moon[0]},0.95)`)
    g.addColorStop(1, `rgba(${p.moon[1]},0.85)`)
    ctx.fillStyle = g
    ctx.beginPath()
    ctx.arc(cx, cy, r, 0, TAU)
    ctx.fill()

    ctx.fillStyle = "rgba(120,130,150,0.22)"
    for (const [x, y, s] of craters) {
      ctx.beginPath()
      ctx.arc(cx + x * r, cy + y * r, s * r, 0, TAU)
      ctx.fill()
    }
    ctx.restore()
  }
}

function makeStars(w: number, h: number, p: Palette, count: number): Draw {
  const stars = Array.from({ length: count }, () => ({
    x: rand(0, w),
    y: rand(0, h * 0.8),
    r: Math.random() < 0.12 ? rand(1.3, 1.9) : rand(0.4, 1.1),
    base: rand(0.3, 0.8),
    f: rand(0.8, 2.5),
    p: rand(0, TAU),
  }))
  let meteor: { x: number; y: number; life: number } | null = null
  let nextMeteor = rand(4, 10)

  return (ctx, t, dt) => {
    ctx.save()
    for (const s of stars) {
      const a = s.base * (0.55 + 0.45 * Math.sin(t * s.f + s.p))
      ctx.fillStyle = `rgba(${p.star},${a})`
      ctx.beginPath()
      ctx.arc(s.x, s.y, s.r, 0, TAU)
      ctx.fill()
      if (s.r > 1.3) {
        // Diffraction spikes on the brightest stars
        const len = s.r * 4 * a
        ctx.strokeStyle = `rgba(${p.star},${a * 0.5})`
        ctx.lineWidth = 0.6
        ctx.beginPath()
        ctx.moveTo(s.x - len, s.y)
        ctx.lineTo(s.x + len, s.y)
        ctx.moveTo(s.x, s.y - len)
        ctx.lineTo(s.x, s.y + len)
        ctx.stroke()
      }
    }

    nextMeteor -= dt
    if (!meteor && nextMeteor <= 0) {
      meteor = { x: rand(0.1, 0.6) * w, y: rand(0, 0.3) * h, life: 0 }
      nextMeteor = rand(6, 14)
    }
    if (meteor) {
      meteor.life += dt
      const k = meteor.life / 0.8 // 0.8s flight
      const hx = meteor.x + 520 * meteor.life
      const hy = meteor.y + 260 * meteor.life
      const alpha = Math.sin(Math.PI * Math.min(k, 1))
      const g = ctx.createLinearGradient(hx, hy, hx - 90, hy - 45)
      g.addColorStop(0, `rgba(${p.star},${alpha})`)
      g.addColorStop(1, `rgba(${p.star},0)`)
      ctx.strokeStyle = g
      ctx.lineWidth = 1.3
      ctx.lineCap = "round"
      ctx.beginPath()
      ctx.moveTo(hx, hy)
      ctx.lineTo(hx - 90, hy - 45)
      ctx.stroke()
      if (k >= 1) meteor = null
    }
    ctx.restore()
  }
}

function makeRain(
  w: number,
  h: number,
  p: Palette,
  count: number,
  windSpeed: number,
  heavy: boolean
): Draw {
  const slant = Math.min(windSpeed * 0.04, 0.35) // horizontal px per vertical px
  const boost = heavy ? 1.25 : 1
  const drops = Array.from({ length: count }, () => ({
    x: rand(-0.3 * w, w),
    y: rand(-h, h),
    z: Math.random(),
  }))
  // Three depth layers, batched into one stroke each
  const layers: [lo: number, hi: number, alpha: number, width: number][] = [
    [0, 0.4, 0.14, 0.6],
    [0.4, 0.75, 0.24, 1],
    [0.75, 1.01, 0.4, 1.4],
  ]
  const splashes: { x: number; y: number; life: number }[] = []

  return (ctx, _t, dt) => {
    ctx.save()
    ctx.lineCap = "round"
    for (const [lo, hi, alpha, width] of layers) {
      ctx.strokeStyle = `rgba(${p.rain},${alpha})`
      ctx.lineWidth = width
      ctx.beginPath()
      for (const d of drops) {
        if (d.z < lo || d.z >= hi) continue
        const v = (700 + 900 * d.z) * boost
        const len = (8 + 26 * d.z) * boost
        d.y += v * dt
        d.x += v * slant * dt
        // Near drops land lower on screen, giving the ground some depth
        const floor = d.z > 0.6 ? h * (0.86 + 0.14 * d.z) : h + len
        if (d.y > floor) {
          if (d.z > 0.6 && splashes.length < 60)
            splashes.push({ x: d.x, y: floor, life: 0 })
          d.y = rand(-80, -10)
          d.x = rand(-0.3 * w, w)
        }
        ctx.moveTo(d.x, d.y)
        ctx.lineTo(d.x - len * slant, d.y - len)
      }
      ctx.stroke()
    }

    ctx.lineWidth = 0.8
    for (let i = splashes.length - 1; i >= 0; i--) {
      const s = splashes[i]
      s.life += dt
      if (s.life > 0.35) {
        splashes.splice(i, 1)
        continue
      }
      const r = 1 + s.life * 28
      ctx.strokeStyle = `rgba(${p.rain},${0.45 * (1 - s.life / 0.35)})`
      ctx.beginPath()
      ctx.ellipse(s.x, s.y, r * 1.8, r * 0.5, 0, 0, TAU)
      ctx.stroke()
    }

    // Ground mist
    const g = ctx.createLinearGradient(0, h * 0.7, 0, h)
    g.addColorStop(0, `rgba(${p.rain},0)`)
    g.addColorStop(1, `rgba(${p.rain},${heavy ? 0.1 : 0.06})`)
    ctx.fillStyle = g
    ctx.fillRect(0, h * 0.7, w, h * 0.3)
    ctx.restore()
  }
}

function makeLightning(w: number, h: number, p: Palette): Draw {
  let timer = rand(1.5, 4)
  let flash = 0
  let bolt: [number, number][][] = []

  const branch = (
    x: number,
    y: number,
    angle: number,
    len: number,
    depth: number
  ) => {
    const pts: [number, number][] = [[x, y]]
    const steps = 9
    for (let i = 0; i < steps; i++) {
      angle += rand(-0.35, 0.35)
      x += Math.sin(angle) * (len / steps)
      y += Math.cos(angle) * (len / steps)
      pts.push([x, y])
      if (depth < 2 && Math.random() < 0.22)
        branch(x, y, angle + rand(-0.9, 0.9), len * 0.4, depth + 1)
    }
    bolt.push(pts)
  }

  return (ctx, _t, dt) => {
    timer -= dt
    if (timer <= 0) {
      bolt = []
      branch(
        rand(0.25, 0.75) * w,
        -10,
        rand(-0.25, 0.25),
        h * rand(0.6, 0.95),
        0
      )
      flash = 1
      // Occasional quick double strike
      timer = Math.random() < 0.3 ? rand(0.08, 0.2) : rand(3, 8)
    }
    if (flash <= 0) return

    ctx.save()
    ctx.fillStyle = `rgba(${p.flash},${0.16 * flash})`
    ctx.fillRect(0, 0, w, h)
    ctx.globalCompositeOperation = p.blend
    ctx.shadowColor = `rgba(${p.flash},1)`
    ctx.shadowBlur = 16
    ctx.strokeStyle = `rgba(245,240,255,${flash})`
    ctx.lineJoin = "round"
    bolt.forEach((pts, i) => {
      ctx.lineWidth = i === bolt.length - 1 ? 2 : 1 // trunk is pushed last
      ctx.beginPath()
      pts.forEach(([x, y], j) => (j ? ctx.lineTo(x, y) : ctx.moveTo(x, y)))
      ctx.stroke()
    })
    ctx.restore()
    flash -= dt * 4
  }
}

function makeSnow(
  w: number,
  h: number,
  p: Palette,
  count: number,
  windSpeed: number
): Draw {
  const sprite = softDot(32, p.snow)
  const flakes = Array.from({ length: count }, () => ({
    x: rand(0, w),
    y: rand(0, h),
    z: Math.random(),
    p: rand(0, TAU),
  }))
  flakes.sort((a, b) => a.z - b.z)
  return (ctx, t, dt) => {
    for (const f of flakes) {
      const size = 2 + f.z * f.z * 10 // near flakes become soft bokeh
      const sway = Math.sin(t * (0.5 + f.z) + f.p) * (10 + 20 * f.z)
      f.x += (sway + windSpeed * 4 * f.z) * dt
      f.y += (18 + 55 * f.z) * dt
      if (f.y > h + size) {
        f.y = -size
        f.x = rand(0, w)
      }
      if (f.x > w + size) f.x = -size
      if (f.x < -size) f.x = w + size
      ctx.globalAlpha = 0.3 + 0.6 * f.z
      ctx.drawImage(sprite, f.x - size / 2, f.y - size / 2, size, size)
    }
    ctx.globalAlpha = 1
  }
}

function makeFog(w: number, h: number, p: Palette): Draw {
  const sprite = softDot(128, p.fog)
  const banks = Array.from({ length: 9 }, () => ({
    x: rand(-0.3 * w, w),
    y: rand(0.15, 1) * h,
    sw: rand(0.6, 1.2) * w,
    sh: rand(0.25, 0.5) * h,
    speed: rand(4, 14) * (Math.random() < 0.5 ? -1 : 1),
    a: rand(0.1, 0.2),
    p: rand(0, TAU),
  }))
  return (ctx, t, dt) => {
    for (const b of banks) {
      b.x += b.speed * dt
      if (b.x > w) b.x = -b.sw
      if (b.x < -b.sw) b.x = w
      ctx.globalAlpha = b.a * (0.75 + 0.25 * Math.sin(t * 0.3 + b.p))
      ctx.drawImage(sprite, b.x, b.y - b.sh / 2, b.sw, b.sh)
    }
    ctx.globalAlpha = 1
  }
}

function makeWind(w: number, h: number, p: Palette, windSpeed: number): Draw {
  const reset = (s: { x: number; y: number }, anywhere: boolean) => {
    s.x = anywhere ? rand(0, w) : -rand(0, w * 0.3)
    s.y = rand(0.05, 0.95) * h
  }
  const streaks = Array.from({ length: 18 }, () => {
    const s = {
      x: 0,
      y: 0,
      len: rand(80, 220),
      speed: rand(160, 320) * (1 + windSpeed * 0.05),
      amp: rand(4, 14),
      f: rand(0.006, 0.014),
      p: rand(0, TAU),
      a: rand(0.12, 0.3),
      lw: rand(0.8, 1.6),
    }
    reset(s, true)
    return s
  })
  return (ctx, t, dt) => {
    ctx.save()
    ctx.lineCap = "round"
    for (const s of streaks) {
      s.x += s.speed * dt
      if (s.x - s.len > w) reset(s, false)
      // Tapered gust: fades in along the tail, bright near the head
      const g = ctx.createLinearGradient(s.x - s.len, 0, s.x, 0)
      g.addColorStop(0, `rgba(${p.wind},0)`)
      g.addColorStop(0.85, `rgba(${p.wind},${s.a})`)
      g.addColorStop(1, `rgba(${p.wind},0)`)
      ctx.strokeStyle = g
      ctx.lineWidth = s.lw
      ctx.beginPath()
      for (let i = 0; i <= 16; i++) {
        const px = s.x - s.len + (s.len * i) / 16
        const py = s.y + Math.sin(px * s.f + t * 2 + s.p) * s.amp
        if (i) ctx.lineTo(px, py)
        else ctx.moveTo(px, py)
      }
      ctx.stroke()
    }
    ctx.restore()
  }
}

function buildScene(
  condition: WeatherConditionType,
  isNight: boolean,
  windSpeed: number,
  dark: boolean,
  w: number,
  h: number
): Draw[] {
  const p = palette(dark)
  const c = p.clouds
  switch (condition === "SUNNY" && isNight ? "CLEAR_NIGHT" : condition) {
    case "SUNNY":
      return [makeSun(w, h, p, 1)]
    case "CLEAR_NIGHT":
      return [makeStars(w, h, p, 80), makeMoon(w, h, p)]
    case "PARTLY_CLOUDY_DAY":
      return [makeSun(w, h, p, 0.75), makeClouds(w, h, 4, c.day, windSpeed)]
    case "PARTLY_CLOUDY_NIGHT":
      return [
        makeStars(w, h, p, 45),
        makeMoon(w, h, p),
        makeClouds(w, h, 4, c.night, windSpeed),
      ]
    case "CLOUDY":
      return [makeClouds(w, h, 7, isNight ? c.night : c.grey, windSpeed, 0.6)]
    case "RAIN":
      return [
        makeClouds(w, h, 5, c.rain, windSpeed, 0.3),
        makeRain(w, h, p, 90, windSpeed, false),
      ]
    case "HEAVY_RAIN":
      return [
        makeClouds(w, h, 6, c.rain, windSpeed, 0.3),
        makeRain(w, h, p, 170, windSpeed, true),
      ]
    case "STORM":
      return [
        makeLightning(w, h, p),
        makeClouds(w, h, 6, c.storm, windSpeed, 0.3),
        makeRain(w, h, p, 150, windSpeed, true),
      ]
    case "SNOW":
      return [
        makeClouds(w, h, 4, c.grey, windSpeed, 0.25),
        makeSnow(w, h, p, 90, windSpeed),
      ]
    case "FOG":
      return [makeFog(w, h, p)]
    case "WINDY":
      return [
        makeClouds(w, h, 3, c.grey, windSpeed + 10, 0.4),
        makeWind(w, h, p, windSpeed),
      ]
    default:
      return []
  }
}

const GLOW: Partial<Record<WeatherConditionType, string>> = {
  RAIN: "bg-gradient-to-b from-sky-950/25 via-transparent to-blue-950/20",
  HEAVY_RAIN:
    "bg-gradient-to-b from-slate-950/35 via-sky-950/15 to-blue-950/25",
  STORM:
    "bg-gradient-to-b from-indigo-950/35 via-purple-950/15 to-slate-950/30",
  SNOW: "bg-gradient-to-b from-sky-900/15 via-transparent to-slate-200/5",
  SUNNY:
    "bg-gradient-to-bl from-amber-500/10 via-orange-500/[0.03] to-transparent",
  CLEAR_NIGHT:
    "bg-gradient-to-bl from-indigo-950/40 via-slate-950/20 to-transparent",
  CLOUDY: "bg-gradient-to-b from-slate-700/15 via-transparent to-slate-900/10",
  PARTLY_CLOUDY_DAY:
    "bg-gradient-to-bl from-amber-500/[0.07] via-transparent to-transparent",
  PARTLY_CLOUDY_NIGHT:
    "bg-gradient-to-bl from-indigo-950/30 via-transparent to-transparent",
  FOG: "bg-gradient-to-b from-slate-500/10 via-slate-600/10 to-slate-700/15",
  WINDY: "bg-gradient-to-r from-teal-950/20 via-transparent to-cyan-950/15",
}

export function WeatherAtmosphere({
  condition,
  isNight = false,
  windSpeed = 3,
  className = "",
}: WeatherAtmosphereProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const { resolvedTheme } = useTheme()
  const dark = resolvedTheme !== "light"

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (!canvas || !ctx) return

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches
    let frame = 0
    let w = 0
    let h = 0
    let scene: Draw[] = []
    let last = performance.now()
    let t = 0

    const render = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05) // clamp after tab switches
      last = now
      t += dt
      ctx.clearRect(0, 0, w, h)
      for (const draw of scene) draw(ctx, t, dt)
      if (!reducedMotion) frame = requestAnimationFrame(render)
    }

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      if (!rect.width || !rect.height) return
      const dpr = window.devicePixelRatio || 1
      w = rect.width
      h = rect.height
      canvas.width = w * dpr
      canvas.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      scene = buildScene(condition, isNight, windSpeed, dark, w, h)
      if (reducedMotion) render(last) // single static frame
    }

    const observer = new ResizeObserver(resize)
    observer.observe(canvas)
    resize()
    if (!reducedMotion) frame = requestAnimationFrame(render)

    const onVisibility = () => {
      cancelAnimationFrame(frame)
      if (!document.hidden && !reducedMotion) {
        last = performance.now()
        frame = requestAnimationFrame(render)
      }
    }
    document.addEventListener("visibilitychange", onVisibility)

    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
      document.removeEventListener("visibilitychange", onVisibility)
    }
  }, [condition, isNight, windSpeed, dark])

  const glow =
    GLOW[condition === "SUNNY" && isNight ? "CLEAR_NIGHT" : condition] ?? ""

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 overflow-hidden transition-colors duration-700 select-none ${glow} ${className}`}
    >
      <canvas ref={canvasRef} className="block size-full" />
    </div>
  )
}
