import { NextRequest, NextResponse } from "next/server"
import { MsEdgeTTS, OUTPUT_FORMAT } from "msedge-tts"
import { TTS_VOICES, resolveTtsVoice } from "@/lib/edge-tts"

const EDGE_TTS_TIMEOUT_MS = 20000
const MAX_INPUT_CHARS = 5000

/**
 * Delivery styles as SSML prosody (the free Edge endpoint has no
 * speaking-style support, so rate and pitch approximate each mood).
 */
const DELIVERY_STYLE_PROSODY: Record<
  string,
  { rate?: string; pitch?: string }
> = {
  meteorological: {},
  cheerful: { rate: "+5%", pitch: "+1st" },
  energetic: { rate: "+15%", pitch: "+2st" },
  calm: { rate: "-10%", pitch: "-1st" },
  authoritative: { rate: "-5%", pitch: "-2st" },
}

const FALLBACK = {
  error: "TTS unavailable, use browser Web Speech fallback",
  fallback: true,
}

/** msedge-tts inserts text into SSML verbatim, so XML must be escaped. */
function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
}

async function synthesize(
  voice: string,
  text: string,
  prosody: { rate?: string; pitch?: string }
): Promise<Buffer> {
  // One instance per request: msedge-tts keeps per-voice state on the instance.
  const tts = new MsEdgeTTS()
  try {
    await tts.setMetadata(voice, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3)
    const { audioStream } = tts.toStream(escapeXml(text), prosody)
    const chunks: Buffer[] = []
    const done = (async () => {
      for await (const chunk of audioStream) chunks.push(chunk as Buffer)
    })()
    await Promise.race([
      done,
      new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error("Edge TTS timed out")),
          EDGE_TTS_TIMEOUT_MS
        )
      ),
    ])
    return Buffer.concat(chunks)
  } finally {
    tts.close()
  }
}

export async function POST(request: NextRequest) {
  try {
    const { text, voiceName, deliveryStyle } = await request.json()

    if (!text || typeof text !== "string") {
      return NextResponse.json(
        { error: "Missing text parameter" },
        { status: 400 }
      )
    }
    const input = text.trim().slice(0, MAX_INPUT_CHARS)
    if (!input) {
      return NextResponse.json({ error: "Text is empty" }, { status: 400 })
    }

    const voice = resolveTtsVoice(voiceName)
    const prosody =
      (typeof deliveryStyle === "string" &&
        DELIVERY_STYLE_PROSODY[deliveryStyle]) ||
      {}

    const audio = await synthesize(voice, input, prosody)
    if (audio.length === 0) {
      console.warn(`Edge TTS returned no audio for ${voice}`)
      return NextResponse.json(FALLBACK)
    }

    return NextResponse.json({
      audioContent: audio.toString("base64"),
      mimeType: "audio/mpeg",
      provider: "edge-tts",
      voice,
    })
  } catch (err: unknown) {
    console.warn("Edge TTS request failed:", err)
    return NextResponse.json(FALLBACK)
  }
}

/** GET /api/tts: static engine info (no upstream call). */
export async function GET() {
  return NextResponse.json({
    provider: "edge-tts",
    configured: true,
    voiceCount: TTS_VOICES.length,
  })
}
