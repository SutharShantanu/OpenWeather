/**
 * Formats time in seconds to mm:ss format.
 */
export function formatAudioTime(seconds: number): string {
  if (!seconds || isNaN(seconds) || seconds < 0) return "0:00"
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`
}

/**
 * Calculates responsive waveform bar height based on playback state, audio tone, pitch, and speed.
 */
export function getAudioBarHeight(
  i: number,
  total: number,
  tick: number,
  status: "idle" | "loading" | "playing" | "paused",
  tone: string,
  pitch: number,
  speed: number
): number {
  const x = i / (total - 1)

  if (status === "idle") {
    // Elegant resting acoustic bell curve
    const resting = 16 + Math.sin(x * Math.PI) * 22 + Math.sin(x * Math.PI * 3) * 6
    return Math.round(resting)
  }

  if (status === "loading") {
    // Dynamic sweeping wave while synthesizing/buffering
    const sweep = Math.sin(tick * 0.25 - x * 6) * 30 + 35
    return Math.max(12, Math.min(85, Math.round(sweep)))
  }

  if (status === "paused") {
    // Static snapshot of waveform with amber styling
    const frozen = 20 + Math.sin(x * Math.PI) * 35 + Math.cos(x * 8) * 12
    return Math.max(14, Math.min(80, Math.round(frozen)))
  }

  // Live modulated animation when playing
  const phase = tick * 0.2 * speed + i * 0.45
  let wave = Math.sin(phase)

  let toneMult = 1.0
  let toneNoise = 0
  if (tone === "Upbeat") {
    toneMult = 1.45
    toneNoise = Math.sin(tick * 0.45 * speed + i * 1.3) * 22
  } else if (tone === "Firm") {
    toneMult = 1.15
    toneNoise = (i % 2 === 0 ? 15 : -10) * Math.cos(tick * 0.28 * speed)
  } else if (tone === "Bright") {
    toneMult = 1.0 + x * 0.7
    toneNoise = Math.cos(tick * 0.35 * speed + i * 0.9) * 18
  } else if (tone === "Smooth") {
    toneMult = 0.85
    wave = Math.sin(tick * 0.12 * speed + x * Math.PI * 2)
  } else {
    toneMult = 1.0
    toneNoise = Math.sin(tick * 0.22 * speed + i * 0.7) * 12
  }

  const pitchBias = (x - 0.5) * (pitch / 4.0) * 35
  const baseHeight = 42 + wave * 28 * toneMult + toneNoise + pitchBias
  return Math.max(12, Math.min(95, Math.round(baseHeight)))
}
