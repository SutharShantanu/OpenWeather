// Server-only: reads GEMINI_API_KEY. Import only from route handlers.

const API_BASE = "https://generativelanguage.googleapis.com/v1beta/models"

// Tried in order; the next one is used when a model is overloaded or retired.
const MODELS = (
  process.env.GEMINI_MODELS || "gemini-flash-lite-latest,gemini-flash-latest"
)
  .split(",")
  .map((m) => m.trim())
  .filter(Boolean)

const RETRYABLE = new Set([404, 429, 500, 503])

export class GeminiError extends Error {
  constructor(
    message: string,
    readonly status: number
  ) {
    super(message)
  }
}

export function isGeminiConfigured() {
  return Boolean(process.env.GEMINI_API_KEY)
}

export interface GeminiRequest {
  system: string
  /** Earlier turns first, the new user message last. */
  messages: { role: "user" | "model"; text: string }[]
  /** Gemini responseSchema; when set the reply is JSON. */
  schema?: Record<string, unknown>
  signal?: AbortSignal
}

function body({ system, messages, schema }: GeminiRequest) {
  return JSON.stringify({
    systemInstruction: { parts: [{ text: system }] },
    contents: messages.map((m) => ({
      role: m.role,
      parts: [{ text: m.text }],
    })),
    generationConfig: {
      temperature: 0.4,
      maxOutputTokens: 1024,
      ...(schema && {
        responseMimeType: "application/json",
        responseSchema: schema,
      }),
    },
  })
}

/** POSTs to each model in turn until one accepts the request. */
async function request(
  method: string,
  req: GeminiRequest,
  timeoutMs: number
): Promise<Response> {
  const key = process.env.GEMINI_API_KEY
  if (!key) throw new GeminiError("Gemini API key is not configured", 503)

  let lastError = new GeminiError("No Gemini model available", 503)
  for (const model of MODELS) {
    const res = await fetch(`${API_BASE}/${model}:${method}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": key },
      body: body(req),
      // The timeout also covers reading the body, so streams get longer.
      signal: req.signal ?? AbortSignal.timeout(timeoutMs),
    })
    if (res.ok) return res
    const detail = await res.json().catch(() => null)
    lastError = new GeminiError(
      detail?.error?.message || `Gemini returned ${res.status}`,
      res.status
    )
    if (!RETRYABLE.has(res.status)) break
  }
  throw lastError
}

/** One-shot generation; returns the reply text (JSON text when `schema` is set). */
export async function geminiGenerate(req: GeminiRequest): Promise<string> {
  const res = await request("generateContent", req, 20_000)
  const data = await res.json()
  const text: string | undefined = data?.candidates?.[0]?.content?.parts
    ?.map((p: { text?: string }) => p.text ?? "")
    .join("")
  if (!text) throw new GeminiError("Gemini returned an empty response", 502)
  return text
}

/** Streams reply text chunks as they are generated (server-sent events from Gemini). */
export async function geminiStream(
  req: GeminiRequest
): Promise<ReadableStream<string>> {
  const res = await request("streamGenerateContent?alt=sse", req, 60_000)
  const reader = res.body!.pipeThrough(new TextDecoderStream()).getReader()
  let buffer = ""

  return new ReadableStream<string>({
    // Keep reading until text is emitted or the upstream ends: a pull that
    // returns without enqueueing is not called again, which would stall the stream.
    async pull(controller) {
      for (;;) {
        const { done, value } = await reader.read()
        if (done) return controller.close()
        buffer += value.replace(/\r\n/g, "\n")
        const events = buffer.split("\n\n")
        buffer = events.pop() ?? ""
        let emitted = false
        for (const event of events) {
          const line = event.split("\n").find((l) => l.startsWith("data:"))
          if (!line) continue
          try {
            const parts =
              JSON.parse(line.slice(5))?.candidates?.[0]?.content?.parts ?? []
            const text = parts
              .map((p: { text?: string }) => p.text ?? "")
              .join("")
            if (text) {
              controller.enqueue(text)
              emitted = true
            }
          } catch {
            // Ignore a malformed event rather than dropping the whole answer.
          }
        }
        if (emitted) return
      }
    },
    cancel() {
      void reader.cancel()
    },
  })
}
