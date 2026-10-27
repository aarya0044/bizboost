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
const GEMINI_MODELS = [
  'gemini-2.5-flash',
  'gemini-3.8-flash',
  'gemini-2.0-flash',
  'gemini-3.5-flash-lite',
]

const MODELS: Record<string, string> = {
  groq:        process.env.AI_MODEL || 'llama-3.1-8b-instant',
  gemini:      process.env.AI_MODEL || GEMINI_MODELS[0],
  openrouter:  process.env.AI_MODEL || 'mistralai/mistral-7b-instruct:free',
}

// ── Groq ─────────────────────────────────────────────────────────────────────
async function callGroq(system: string, userPrompt: string, modelOverride?: string): Promise<string> {
  const key = process.env.GROQ_API_KEY
  if (!key) throw new Error('GROQ_API_KEY is not set in .env.local')

  const model = modelOverride || MODELS.groq

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model: model,
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
    if (res.status === 404 && model !== 'llama-3.1-8b-instant') {
      console.warn(`Groq model ${model} not available, falling back to llama-3.1-8b-instant`)
      return callGroq(system, userPrompt, 'llama-3.1-8b-instant')
    }
    throw new Error(`Groq error ${res.status}: ${err?.error?.message || res.statusText}`)
  }

  const data = await res.json()
  return data.choices?.[0]?.message?.content ?? ''
}

// ── Gemini ────────────────────────────────────────────────────────────────────
async function callGemini(system: string, userPrompt: string, modelIndex: number = 0): Promise<string> {
  const key = process.env.GEMINI_API_KEY
  if (!key) throw new Error('GEMINI_API_KEY is not set in .env.local')

  const model = process.env.AI_MODEL || GEMINI_MODELS[modelIndex] || GEMINI_MODELS[0]
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    signal: AbortSignal.timeout(25000),
    body: JSON.stringify({
      system_instruction: { parts: [{ text: system }] },
      contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
      generationConfig: { temperature: 0.3, maxOutputTokens: 1500 },
    }),
  })

  if (!res.ok) {
    // If the model has high demand (503), rate limit (429), or 404, cascade to next available Gemini model
    if ((res.status === 503 || res.status === 429 || res.status === 404) && modelIndex < GEMINI_MODELS.length - 1) {
      console.warn(`Gemini model ${model} returned ${res.status}, cascading to ${GEMINI_MODELS[modelIndex + 1]}...`)
      return callGemini(system, userPrompt, modelIndex + 1)
    }
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
  const primary = PROVIDER
  try {
    if (primary === 'gemini') return await callGemini(system, userPrompt)
    if (primary === 'openrouter') return await callOpenRouter(system, userPrompt)
    return await callGroq(system, userPrompt)
  } catch (err: any) {
    console.warn(`Primary provider ${primary} failed (${err.message}), trying backup provider...`)
    if (primary !== 'gemini' && process.env.GEMINI_API_KEY) {
      return await callGemini(system, userPrompt)
    }
    if (primary !== 'groq' && process.env.GROQ_API_KEY) {
      return await callGroq(system, userPrompt)
    }
    throw err
  }
}

// ── Chat Helpers ──────────────────────────────────────────────────────────────
async function callGroqChat(messages: AIMessage[], modelOverride?: string): Promise<string> {
  const key = process.env.GROQ_API_KEY
  if (!key) throw new Error('GROQ_API_KEY is not set in .env.local')

  const model = modelOverride || MODELS.groq

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model: model,
      temperature: 0.7,
      max_tokens: 1500,
      messages: messages,
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    if (res.status === 404 && model !== 'llama-3.1-8b-instant') {
      console.warn(`Groq model ${model} not available, falling back to llama-3.1-8b-instant`)
      return callGroqChat(messages, 'llama-3.1-8b-instant')
    }
    throw new Error(`Groq error ${res.status}: ${err?.error?.message || res.statusText}`)
  }

  const data = await res.json()
  return data.choices?.[0]?.message?.content ?? ''
}

async function callGeminiChat(messages: AIMessage[], modelIndex: number = 0): Promise<string> {
  const key = process.env.GEMINI_API_KEY
  if (!key) throw new Error('GEMINI_API_KEY is not set in .env.local')

  const model = process.env.AI_MODEL || GEMINI_MODELS[modelIndex] || GEMINI_MODELS[0]
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`

  const systemMessage = messages.find(m => m.role === 'system')?.content || ''
  const chatMessages = messages.filter(m => m.role !== 'system')

  const body: any = {
    contents: chatMessages.map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    })),
    generationConfig: { temperature: 0.7, maxOutputTokens: 1500 },
  }

  if (systemMessage) {
    body.system_instruction = { parts: [{ text: systemMessage }] }
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    signal: AbortSignal.timeout(25000),
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    if ((res.status === 503 || res.status === 429 || res.status === 404) && modelIndex < GEMINI_MODELS.length - 1) {
      console.warn(`Gemini model ${model} returned ${res.status}, cascading to ${GEMINI_MODELS[modelIndex + 1]}...`)
      return callGeminiChat(messages, modelIndex + 1)
    }
    const err = await res.json().catch(() => ({}))
    throw new Error(`Gemini error ${res.status}: ${JSON.stringify(err?.error?.message || res.statusText)}`)
  }

  const data = await res.json()
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
}

async function callOpenRouterChat(messages: AIMessage[]): Promise<string> {
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
      temperature: 0.7,
      max_tokens: 1500,
      messages: messages,
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(`OpenRouter error ${res.status}: ${err?.error?.message || res.statusText}`)
  }

  const data = await res.json()
  return data.choices?.[0]?.message?.content ?? ''
}

export async function askAIChat(messages: AIMessage[]): Promise<string> {
  const primary = PROVIDER
  try {
    if (primary === 'gemini') return await callGeminiChat(messages)
    if (primary === 'openrouter') return await callOpenRouterChat(messages)
    return await callGroqChat(messages)
  } catch (err: any) {
    console.warn(`Primary chat provider ${primary} failed (${err.message}), trying backup provider...`)
    if (primary !== 'gemini' && process.env.GEMINI_API_KEY) {
      return await callGeminiChat(messages)
    }
    if (primary !== 'groq' && process.env.GROQ_API_KEY) {
      return await callGroqChat(messages)
    }
    throw err
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
