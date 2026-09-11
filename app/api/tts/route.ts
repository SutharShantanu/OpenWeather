import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      text,
      voiceName = "en-US-Journey-F",
      model = "Journey",
      languageCode = "en-US",
      ssmlGender = "FEMALE",
      speakingRate = 1.0,
      pitch = 0.0,
      volumeGainDb = 0.0,
      effectsProfileId = "headphone-class-device",
      apiKey,
    } = body;

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Missing text parameter" }, { status: 400 });
    }

    const trimmedText = text.trim();
    if (!trimmedText) {
      return NextResponse.json({ error: "Text is empty" }, { status: 400 });
    }

    // 1. Check for Google Cloud Text-to-Speech API Key (User provided or env)
    const googleCloudKey =
      apiKey?.trim() ||
      process.env.GOOGLE_TTS_API_KEY ||
      process.env.GOOGLE_API_KEY ||
      process.env.GEMINI_API_KEY;

    if (googleCloudKey) {
      try {
        const cloudUrl = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${encodeURIComponent(
          googleCloudKey
        )}`;

        // Map gender
        const mappedGender =
          voiceName.endsWith("-D") || voiceName.endsWith("-Q") || voiceName.endsWith("-B")
            ? "MALE"
            : ssmlGender || "FEMALE";

        // Extract full BCP-47 locale from voiceName if present (e.g. "en-US-Studio-Q" -> "en-US")
        const voiceLocale = voiceName.includes("-")
          ? voiceName.split("-").slice(0, 2).join("-")
          : languageCode || "en-US";

        const cloudRes = await fetch(cloudUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            input: { text: trimmedText },
            voice: {
              languageCode: voiceLocale,
              name: voiceName,
              ssmlGender: mappedGender,
            },
            audioConfig: {
              audioEncoding: "MP3",
              speakingRate: Math.max(0.25, Math.min(4.0, Number(speakingRate) || 1.0)),
              pitch: Math.max(-20.0, Math.min(20.0, Number(pitch) || 0.0)),
              volumeGainDb: Math.max(-96.0, Math.min(16.0, Number(volumeGainDb) || 0.0)),
              effectsProfileId: effectsProfileId ? [effectsProfileId] : ["headphone-class-device"],
            },
          }),
        });

        if (cloudRes.ok) {
          const cloudData = await cloudRes.json();
          if (cloudData.audioContent) {
            return NextResponse.json({
              audioContent: cloudData.audioContent,
              provider: "google-cloud-tts",
              model,
              voice: voiceName,
            });
          }
        } else {
          const errText = await cloudRes.text();
          console.warn("Google Cloud TTS API responded with error:", cloudRes.status, errText);
        }
      } catch (cloudErr) {
        console.warn("Google Cloud TTS request failed:", cloudErr);
      }
    }

    // 2. Direct Fallback: Google TTS Audio Stream (Keyless Google Audio Engine)
    try {
      const shortLang = (languageCode || "en").split("-")[0].toLowerCase();
      // Chunk text into sentence segments under 180 chars for optimal audio synthesis
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
        const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${encodeURIComponent(
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
          provider: "google-tts-keyless",
          model: model || "Standard",
          voice: voiceName,
        });
      }
    } catch (streamErr) {
      console.warn("Keyless Google TTS stream failed:", streamErr);
    }

    return NextResponse.json(
      { error: "Google TTS unavailable, use browser Web Speech fallback", fallback: true },
      { status: 200 }
    );
  } catch (err: unknown) {
    console.error("TTS Route Exception:", err);
    return NextResponse.json({ error: "Internal TTS Route Error" }, { status: 500 });
  }
}
