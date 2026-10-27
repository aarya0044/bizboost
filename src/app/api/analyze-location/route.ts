import { NextRequest, NextResponse } from 'next/server'
import { askAI, parseJSON } from '@/lib/ai'
import { fetchOSMCompetitors } from '@/lib/osm'

// Allow up to 60 seconds on Vercel Hobby plan
export const maxDuration = 60

async function fetchCompetitors(bizType: string, location: string, apiKey: string) {
  try {
    if (apiKey) {
      try {
        const query = encodeURIComponent(`${bizType} in ${location}`)
        const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${query}&key=${apiKey}`
        const res = await fetch(url, { signal: AbortSignal.timeout(5000) })
        const data = await res.json()
        if (data.results && data.results.length > 0) {
          return data.results.slice(0, 6).map((p: any) => ({
            name: p.name,
            rating: p.rating ?? 'N/A',
            total: p.user_ratings_total ?? 0,
            address: p.formatted_address ?? '',
          }))
        }
      } catch {
        // Fallback to OSM
      }
    }
    // OpenStreetMap free fallback
    return await fetchOSMCompetitors(bizType, location)
  } catch {
    // If all competitor fetching fails, return null and proceed without it
    return null
  }
}

export async function POST(req: NextRequest) {
  try {
    const { bizType, location, usp, customers, placesApiKey } = await req.json()
    if (!bizType || !location) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

    // Run competitor fetch and AI call in parallel to save time.
    // The AI call does not depend on competitor data for a useful result;
    // if competitor data arrives first, we include it, otherwise we proceed without.
    const competitorPromise = fetchCompetitors(bizType, location, placesApiKey).catch(() => null)

    const system = `You are a business location intelligence expert with deep knowledge of Indian cities,
local markets, and consumer behaviour. Return ONLY raw JSON — no markdown fences, no preamble.`

    // Build prompt without waiting for competitors (they are optional context)
    const basePrompt = `Analyze this business opportunity in India:
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

    // Try to get competitors first (with a short race timeout so we don't block the AI call)
    let competitors: any = null
    try {
      competitors = await Promise.race([
        competitorPromise,
        new Promise(resolve => setTimeout(() => resolve(null), 3000)),
      ])
    } catch {
      competitors = null
    }

    const competitorContext = competitors && competitors.length > 0
      ? `Real competitor data from map database:\n` +
        competitors.map((c: any) => `- ${c.name}: ${c.rating === 'Map Data' ? 'Physical Shop' : c.rating + ' (' + c.total + ' reviews)'} — ${c.address}`).join('\n')
      : 'No live competitor data — estimate based on city and locality knowledge.'

    const prompt = basePrompt.replace(
      'Return this EXACT JSON shape:',
      competitorContext + '\n\nReturn this EXACT JSON shape:'
    )

    const raw = await askAI(system, prompt)
    const result = parseJSON(raw)
    return NextResponse.json({ result, competitors })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
