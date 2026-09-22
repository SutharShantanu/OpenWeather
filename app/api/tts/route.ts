import { NextRequest, NextResponse } from "next/server";
import { CONFIG } from "@/lib/config";
import { VALID_GEMINI_VOICES, resolveGeminiVoice } from "@/lib/google-tts";
import {
  DEFAULT_GOOGLE_AI_KEY,
  DEFAULT_GEMINI_TTS_MODEL,
  DEFAULT_GEMINI_SAMPLE_RATE,
} from "@/lib/constants";

/**
 * Prepend standard 44-byte RIFF/WAV header to raw linear 16-bit PCM bytes
 * so any browser <audio> element or Web Audio context can play it immediately.
 */
function pcmToWav(
  pcmBuffer: Buffer,
  sampleRate = DEFAULT_GEMINI_SAMPLE_RATE,
  numChannels = 1,
  bitsPerSample = 16
): Buffer {
  const header = Buffer.alloc(44);
  const dataLength = pcmBuffer.length;
  const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
  const blockAlign = numChannels * (bitsPerSample / 8);

  header.write("RIFF", 0);
  header.writeUInt32LE(36 + dataLength, 4);
  header.write("WAVE", 8);
  header.write("fmt ", 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20); // Linear PCM
  header.writeUInt16LE(numChannels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(bitsPerSample, 34);
  header.write("data", 36);
  header.writeUInt32LE(dataLength, 40);

  return Buffer.concat([header, pcmBuffer]);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      text,
      voiceName = "Kore",
      model = "gemini-2.5-flash-preview-tts",
      speakingRate = 1.0,
      pitch = 0.0,
      volumeGainDb = 0.0,
      effectsProfileId,
      languageCode = "en",
      apiKey,
    } = body;

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Missing text parameter" }, { status: 400 });
    }

    const trimmedText = text.trim();
    if (!trimmedText) {
      return NextResponse.json({ error: "Text is empty" }, { status: 400 });
    }

    const rawApiKey =
      apiKey?.trim() ||
      process.env.GEMINI_API_KEY ||
      process.env.GOOGLE_API_KEY ||
      CONFIG.keys.googleTtsApiKey ||
      "";

    // Only attempt cloud synthesize if key is a real user-provided key (not the dummy placeholder "AQ...")
    const isPlaceholderKey = !rawApiKey || rawApiKey.startsWith("AQ.") || rawApiKey === DEFAULT_GOOGLE_AI_KEY;
    const resolvedApiKey = isPlaceholderKey ? "" : rawApiKey;

    const targetVoice = resolveGeminiVoice(voiceName);

    // 1. Try Official Google Cloud Text-to-Speech synthesize API if Google Cloud Voice/Model requested
    const isGoogleVoice =
      voiceName.includes("-") ||
      ["Journey", "Studio", "Neural2", "WaveNet", "Standard"].some((m) =>
        model?.toLowerCase().includes(m.toLowerCase())
      );

    if (resolvedApiKey && isGoogleVoice) {
      try {
        const langCode =
          voiceName.split("-").length >= 2
            ? `${voiceName.split("-")[0]}-${voiceName.split("-")[1]}`
            : languageCode || "en-US";
        const ttsUrl = `${CONFIG.api.googleTtsApiBaseUrl}/text:synthesize?key=${resolvedApiKey}`;
        const gRes = await fetch(ttsUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: AbortSignal.timeout(2000),
          body: JSON.stringify({
            input: { text: trimmedText },
            voice: {
              languageCode: langCode,
              name: voiceName,
            },
            audioConfig: {
              audioEncoding: "MP3",
              speakingRate: Number(speakingRate) || 1.0,
              pitch: Number(pitch) || 0.0,
              volumeGainDb: Number(volumeGainDb) || 0.0,
              effectsProfileId: effectsProfileId ? [effectsProfileId] : [],
            },
          }),
        });

        if (gRes.ok) {
          const gData = await gRes.json();
          if (gData.audioContent) {
            return NextResponse.json({
              audioContent: gData.audioContent,
              mimeType: "audio/mpeg",
              provider: "google-cloud-tts",
              model: model || "Standard",
              voice: voiceName,
            });
          }
        }
      } catch (cloudErr) {
        console.warn("Google Cloud TTS API synthesize error:", cloudErr);
      }
    }

    // 2. Try Gemini Native Text-to-Speech Generation API
    if (resolvedApiKey) {
      const primaryModel =
        model && model.includes("gemini")
          ? model
          : "gemini-2.5-flash-preview-tts";
      const candidateModels = Array.from(
        new Set([
          primaryModel,
          "gemini-2.5-flash-preview-tts",
          "gemini-3.1-flash-tts-preview",
        ])
      );

      const geminiUrl = "https://generativelanguage.googleapis.com/v1beta/interactions";

      for (const geminiModel of candidateModels) {
        try {
          const res = await fetch(geminiUrl, {
            method: "POST",
            headers: {
              "x-goog-api-key": resolvedApiKey,
              "Content-Type": "application/json",
            },
            signal: AbortSignal.timeout(2000),
            body: JSON.stringify({
              model: geminiModel,
              input: trimmedText,
              response_format: { type: "audio" },
              generation_config: {
                speech_config: [{ voice: targetVoice }],
              },
            }),
          });

          if (res.ok) {
            const data = await res.json();
            let base64Pcm: string | null = null;
            let sampleRate = 24000;
            let channels = 1;

            // Search in steps.content
            if (Array.isArray(data.steps)) {
              for (const step of data.steps) {
                if (Array.isArray(step.content)) {
                  const part = step.content.find(
                    (p: { type?: string; data?: string }) => p.type === "audio" || !!p.data
                  );
                  if (part) {
                    base64Pcm = part.data;
                    sampleRate = part.sample_rate || 24000;
                    channels = part.channels || 1;
                    break;
                  }
                }
              }
            }

            // Search in outputs.parts
            if (!base64Pcm && Array.isArray(data.outputs)) {
              for (const out of data.outputs) {
                if (Array.isArray(out.parts)) {
                  const part = out.parts.find(
                    (p: { type?: string; data?: string }) => p.type === "audio" || !!p.data
                  );
                  if (part) {
                    base64Pcm = part.data;
                    sampleRate = part.sample_rate || 24000;
                    channels = part.channels || 1;
                    break;
                  }
                }
              }
            }

            // Search convenience property
            if (!base64Pcm && data.output_audio?.data) {
              base64Pcm = data.output_audio.data;
            }

            if (base64Pcm) {
              const pcmBuffer = Buffer.from(base64Pcm, "base64");
              const wavBuffer = pcmToWav(pcmBuffer, sampleRate, channels, 16);

              return NextResponse.json({
                audioContent: wavBuffer.toString("base64"),
                mimeType: "audio/wav",
                provider: "gemini-tts",
                model: geminiModel,
                voice: targetVoice,
              });
            }
          } else {
            const errData = await res.text();
            console.warn(`Gemini TTS API returned error (${geminiModel}, status ${res.status}):`, errData);
          }
        } catch (geminiErr) {
          console.warn(`Gemini TTS call failed for ${geminiModel}:`, geminiErr);
        }
      }
    }

    // 2. Direct Fallback: Keyless Audio Stream
    try {
      const shortLang = (body.languageCode || "en").split("-")[0].toLowerCase();
      const words = trimmedText.split(/\s+/);
      const chunks: string[] = [];
      let currentChunk = "";

      for (const word of words) {
        if ((currentChunk + " " + word).trim().length > 180) {
          if (currentChunk) chunks.push(currentChunk.trim());
          currentChunk = word;
        } else {
          currentChunk = currentChunk ? `${currentChunk} ${word}` : word;
        }
      }
      if (currentChunk) chunks.push(currentChunk.trim());

      const audioBuffers: Buffer[] = [];
      for (const chunk of chunks.slice(0, 8)) {
        const ttsUrl = `${CONFIG.api.googleTranslateTtsBaseUrl}?ie=UTF-8&tl=${encodeURIComponent(
          shortLang
        )}&client=tw-ob&q=${encodeURIComponent(chunk)}`;

        const ttsRes = await fetch(ttsUrl, {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            Referer: "https://translate.google.com/",
          },
        });

        if (ttsRes.ok) {
          const arrayBuf = await ttsRes.arrayBuffer();
          audioBuffers.push(Buffer.from(arrayBuf));
        }
      }

      if (audioBuffers.length > 0) {
        const combined = Buffer.concat(audioBuffers);
        return NextResponse.json({
          audioContent: combined.toString("base64"),
          mimeType: "audio/mpeg",
          provider: "google-tts-keyless",
          model: "Standard",
          voice: targetVoice,
        });
      }
    } catch (streamErr) {
      console.warn("Keyless TTS stream failed:", streamErr);
    }

    return NextResponse.json(
      { error: "TTS unavailable, use browser Web Speech fallback", fallback: true },
      { status: 200 }
    );
  } catch (err: unknown) {
    console.error("TTS Route Exception:", err);
    return NextResponse.json({ error: "Internal TTS Route Error" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userApiKey = searchParams.get("apiKey")?.trim();
    const resolvedApiKey =
      userApiKey ||
      process.env.GEMINI_API_KEY ||
      process.env.GOOGLE_API_KEY ||
      CONFIG.keys.googleTtsApiKey ||
      DEFAULT_GOOGLE_AI_KEY;

    if (resolvedApiKey) {
      const testModels = [
        "gemini-2.5-flash-preview-tts",
        "gemini-3.1-flash-tts-preview",
      ];
      let verifiedModel: string | null = null;
      let lastError: string | null = null;

      for (const tm of testModels) {
        try {
          const testRes = await fetch(
            "https://generativelanguage.googleapis.com/v1beta/interactions",
            {
              method: "POST",
              headers: {
                "x-goog-api-key": resolvedApiKey,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                model: tm,
                input: "Meteorological handshake verified.",
                response_format: { type: "audio" },
                generation_config: {
                  speech_config: [{ voice: "Kore" }],
                },
              }),
            }
          );

          if (testRes.ok) {
            verifiedModel = tm;
            break;
          } else {
            const errData = await testRes.json().catch(() => ({}));
            lastError = errData?.error?.message || `HTTP status ${testRes.status}`;
          }
        } catch (err) {
          lastError = String(err);
        }
      }

      if (verifiedModel) {
        return NextResponse.json({
          provider: "gemini-tts",
          status: "ok",
          model: verifiedModel,
          voiceCount: VALID_GEMINI_VOICES.size,
        });
      } else {
        return NextResponse.json({
          provider: "gemini-tts",
          status: "error",
          error: lastError || "Failed to authenticate Gemini TTS",
        });
      }
    }

    return NextResponse.json({
      provider: "google-tts-keyless",
      status: "ok",
      voiceCount: VALID_GEMINI_VOICES.size,
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: "Failed to verify voice status", details: String(err) },
      { status: 500 }
    );
  }
}
