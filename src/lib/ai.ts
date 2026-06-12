/**
 * Universal AI client — swap providers via AI_PROVIDER env var.
 * Supports: groq (default, free), gemini (free tier), openrouter (free models)
 *
 * Set in .env.local:
 *   AI_PROVIDER=groq          → uses GROQ_API_KEY
 *   AI_PROVIDER=gemini        → uses GEMINI_API_KEY
 *   AI_PROVIDER=openrouter    → uses OPENROUTER_API_KEY
 */

export interface AIMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

const PROVIDER = (process.env.AI_PROVIDER || 'groq').toLowerCase()

// ── Model defaults per provider ──────────────────────────────────────────────
const MODELS: Record<string, string> = {
  groq:        process.env.AI_MODEL || 'llama-3.3-70b-versatile',   // free, very fast
  gemini:      process.env.AI_MODEL || 'gemini-1.5-flash',           // free 15 rpm
  openrouter:  process.env.AI_MODEL || 'mistralai/mistral-7b-instruct:free',
}

// ── Groq ─────────────────────────────────────────────────────────────────────
async function callGroq(system: string, userPrompt: string): Promise<string> {
  const key = process.env.GROQ_API_KEY
  if (!key) throw new Error('GROQ_API_KEY is not set in .env.local')

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model: MODELS.groq,
      temperature: 0.3,
      max_tokens: 1500,
      messages: [
        { role: 'system', content: system },
        { role: 'user',   content: userPrompt },
      ],
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(`Groq error ${res.status}: ${err?.error?.message || res.statusText}`)
  }

  const data = await res.json()
  return data.choices?.[0]?.message?.content ?? ''
}

// ── Gemini ────────────────────────────────────────────────────────────────────
async function callGemini(system: string, userPrompt: string): Promise<string> {
  const key = process.env.GEMINI_API_KEY
  if (!key) throw new Error('GEMINI_API_KEY is not set in .env.local')

  const model = MODELS.gemini
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: system }] },
      contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
      generationConfig: { temperature: 0.3, maxOutputTokens: 1500 },
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(`Gemini error ${res.status}: ${JSON.stringify(err?.error?.message || res.statusText)}`)
  }

  const data = await res.json()
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
}

// ── OpenRouter ────────────────────────────────────────────────────────────────
async function callOpenRouter(system: string, userPrompt: string): Promise<string> {
  const key = process.env.OPENROUTER_API_KEY
  if (!key) throw new Error('OPENROUTER_API_KEY is not set in .env.local')

  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
      'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
      'X-Title': 'BizBoost',
    },
    body: JSON.stringify({
      model: MODELS.openrouter,
      temperature: 0.3,
      max_tokens: 1500,
      messages: [
        { role: 'system', content: system },
        { role: 'user',   content: userPrompt },
      ],
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(`OpenRouter error ${res.status}: ${err?.error?.message || res.statusText}`)
  }

  const data = await res.json()
  return data.choices?.[0]?.message?.content ?? ''
}

// ── Public function ───────────────────────────────────────────────────────────
export async function askAI(system: string, userPrompt: string): Promise<string> {
  switch (PROVIDER) {
    case 'gemini':      return callGemini(system, userPrompt)
    case 'openrouter':  return callOpenRouter(system, userPrompt)
    case 'groq':
    default:            return callGroq(system, userPrompt)
  }
}

/** Parse the LLM response as JSON, stripping any markdown fences. */
export function parseJSON<T>(raw: string): T {
  const clean = raw.replace(/```json|```/gi, '').trim()
  // Some models wrap in a top-level object — try plain parse first
  try { return JSON.parse(clean) as T }
  catch {
    // Last resort: find the first { ... } block
    const match = clean.match(/\{[\s\S]*\}/)
    if (match) return JSON.parse(match[0]) as T
    throw new Error('Could not parse AI response as JSON')
  }
}
