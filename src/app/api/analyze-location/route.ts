import { NextRequest, NextResponse } from 'next/server'
import { askAI, parseJSON } from '@/lib/ai'

async function fetchCompetitors(bizType: string, location: string, apiKey: string) {
  if (!apiKey) return null
  try {
    const query = encodeURIComponent(`${bizType} in ${location}`)
    const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${query}&key=${apiKey}`
    const res = await fetch(url)
    const data = await res.json()
    return data.results?.slice(0, 6).map((p: any) => ({
      name: p.name,
      rating: p.rating ?? 'N/A',
      total: p.user_ratings_total ?? 0,
      address: p.formatted_address ?? '',
    }))
  } catch {
    return null
  }
}

export async function POST(req: NextRequest) {
  try {
    const { bizType, location, usp, customers, placesApiKey } = await req.json()
    if (!bizType || !location) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

    const competitors = await fetchCompetitors(bizType, location, placesApiKey)

    const competitorContext = competitors
      ? `Real competitor data from Google Places:\n` +
        competitors.map((c: any) => `- ${c.name}: ⭐${c.rating} (${c.total} reviews) — ${c.address}`).join('\n')
      : 'No live competitor data — estimate based on city and locality knowledge.'

    const system = `You are a business location intelligence expert with deep knowledge of Indian cities,
local markets, and consumer behaviour. Return ONLY raw JSON — no markdown fences, no preamble.`

    const prompt = `Analyze this business opportunity in India:
Business: ${bizType}
Location: ${location}
Services/USP: ${usp || 'Not specified'}
Target customers: ${customers || 'General public'}
${competitorContext}

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

    const raw = await askAI(system, prompt)
    const result = parseJSON(raw)
    return NextResponse.json({ result, competitors })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
