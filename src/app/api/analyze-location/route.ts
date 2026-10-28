import { NextRequest, NextResponse } from 'next/server'
import { askAIChat, AIMessage, parseJSON } from '@/lib/ai'

// Allow up to 60 seconds on Vercel Hobby plan
export const maxDuration = 60

export async function POST(req: NextRequest) {
  try {
    const { bizType, location, usp, customers } = await req.json()
    if (!bizType || !location) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

    const messages: AIMessage[] = [
      {
        role: 'system',
        content: `You are a business location intelligence expert with deep knowledge of Indian cities, local markets, and consumer behaviour. Return ONLY raw JSON — no markdown fences, no explanation, no preamble.`
      },
      {
        role: 'user',
        content: `Analyze this business opportunity in India:
Business: ${bizType}
Location: ${location}
Services/USP: ${usp || 'Not specified'}
Target customers: ${customers || 'General public'}

Return this EXACT JSON shape:
{
  "viabilityScore": 72,
  "verdict": "Promising",
  "verdictReason": "One sentence summary",
  "footfallScore": 65,
  "demographicMatch": 78,
  "marketGap": 60,
  "keyInsights": [
    {"type":"good","title":"Short title","text":"2-sentence explanation"},
    {"type":"warn","title":"Short title","text":"2-sentence explanation"},
    {"type":"bad","title":"Short title","text":"2-sentence explanation"}
  ],
  "alternativeLocations": [
    {"name":"Area name","distance":"1.5 km","reason":"Specific reason"},
    {"name":"Area name","distance":"2.5 km","reason":"Specific reason"},
    {"name":"Area name","distance":"3 km","reason":"Specific reason"},
    {"name":"Area name","distance":"4 km","reason":"Specific reason"}
  ],
  "topActions": [
    "Concrete action before opening",
    "Second action",
    "Third action"
  ]
}`
      }
    ]

    const raw = await askAIChat(messages)
    const result = parseJSON(raw)
    return NextResponse.json({ result, competitors: null })
  } catch (err: any) {
    console.error('Location analysis error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
