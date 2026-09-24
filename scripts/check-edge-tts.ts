// Run: npx tsx scripts/check-edge-tts.ts   (needs network: calls the Edge TTS endpoint)
import assert from "node:assert/strict"
import { NextRequest } from "next/server"
import {
  MAX_VOICES_PER_GENDER,
  TTS_VOICES,
  resolveTtsVoice,
} from "../lib/edge-tts"
import { POST } from "../app/api/tts/route"

for (const gender of ["MALE", "FEMALE"] as const) {
  const n = TTS_VOICES.filter((v) => v.gender === gender).length
  assert.ok(n <= MAX_VOICES_PER_GENDER, `${gender} voices: ${n}`)
}
assert.equal(
  resolveTtsVoice("en-us-andrewmultilingualneural"),
  "en-US-AndrewMultilingualNeural"
)
assert.equal(resolveTtsVoice("cedar"), "en-US-AvaMultilingualNeural") // retired OpenAI id → default

async function main() {
  // XML-special characters must not break the SSML request.
  const res = await POST(
    new NextRequest("http://localhost/api/tts", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        text: "Rain & wind < 10 km/h — आज बारिश होगी।",
        voiceName: "en-US-AndrewMultilingualNeural",
        deliveryStyle: "calm",
      }),
    })
  ).then((r) => r.json())
  assert.equal(res.provider, "edge-tts", JSON.stringify(res))
  assert.equal(res.voice, "en-US-AndrewMultilingualNeural")
  assert.ok(
    Buffer.from(res.audioContent, "base64").length > 5000,
    "audio too small"
  )
  console.log("check-edge-tts: ok")
}

main()
