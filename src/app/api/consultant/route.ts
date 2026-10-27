import { NextRequest, NextResponse } from 'next/server'
import { askAI, parseJSON } from '@/lib/ai'
import { fetchOSMCompetitors } from '@/lib/osm'

export const maxDuration = 60

export async function POST(req: NextRequest) {
  try {
    const { action, locality, budget, businessType, businessName } = await req.json()
    const bizType = businessType || businessName

    if (!locality) {
      return NextResponse.json({ error: 'Locality is required' }, { status: 400 })
    }

    if (action === 'suggest-ideas' || action === 'suggestions') {
      const system = `You are a professional business consultant specializing in local economies and retail trends in India. Return ONLY raw JSON — no markdown, no preamble, no explanation.`
      const prompt = `Based on the following parameters, suggest exactly 3 highly specific, niche, and highly differentiated local business ideas that have strong growth potential, cater to specific market gaps in this locality, and fit the budget:
Locality: ${locality}
Budget Range: ${budget || 'Flexible'}

CRITICAL GUIDELINES:
- DO NOT suggest generic, cliché startup ideas (e.g. avoid plain coffee shops, cafes, co-working spaces, basic customized gift shops, gym/fitness centers, standard grocery stores, or plain organic food shops).
- DO suggest highly focused micro-niches or specialized hybrid businesses (e.g., instead of a generic cafe, suggest a "Millet-Based Healthy Breakfast QSR" or "Pre-packaged South Indian Filter Coffee Pods & Brewing Kit Store"; instead of a pet shop, suggest a "Mobile Hydrotherapy Pet Grooming Spa"; instead of a clothing store, suggest an "Upcycled Denim & Custom Embroidery Atelier").
- Make sure each suggestion is highly localized and contextually relevant to the demographics and culture of the target locality in India (e.g. if the area is an IT/office hub, address night shift needs or quick-grab healthy products; if residential, address home-delivery convenience, senior care, or children's learning).

Provide the response in this EXACT JSON shape:
{
  "suggestions": [
    {
      "name": "Niche Business Category (e.g., Gourmet Tea and Sourdough Toast QSR)",
      "reason": "1-2 sentences explaining why this fits the local demographics or market gaps in that locality",
      "targetAudience": "Primary customers (e.g. IT employees working night shifts, young families in gated communities)",
      "demand": "High, Medium, or Low depending on the area"
    }
  ]
}`

      const raw = await askAI(system, prompt)
      const result = parseJSON<any>(raw)
      return NextResponse.json({ suggestions: result?.suggestions || [] })
    }

    if (action === 'generate-roadmap' || action === 'roadmap') {
      if (!bizType) {
        return NextResponse.json({ error: 'Business type is required' }, { status: 400 })
      }

      const competitors = await fetchOSMCompetitors(bizType, locality)
      const competitorContext = competitors && competitors.length > 0
        ? `Real physical competitor data from OpenStreetMap map listings in this locality:\n` +
          competitors.map((c: any) => `- ${c.name} (Address: ${c.address})`).join('\n')
        : 'No specific live competitor nodes returned from OpenStreetMap for this search. Estimate based on standard brand presence.'

      const system = `You are a senior business strategist and advisor specializing in startup operations and local marketing in India. Return ONLY raw JSON — no markdown, no preamble, no explanation.`
      const prompt = `Generate a comprehensive startup advisory roadmap for the selected business:
Business Type: ${bizType}
Locality: ${locality}
Budget Range: ${budget || 'Flexible'}
${competitorContext}

Provide the response in this EXACT JSON shape:
{
  "startupCost": {
    "items": [
      { "category": "Rent & Deposit", "cost": "Estimated cost in Rupees (e.g., ₹1.5 Lakhs)", "notes": "Details on deposit or rental terms in this type of locality" },
      { "category": "Interior & Equipment", "cost": "Estimated cost in Rupees", "notes": "Essential setup equipment needed" },
      { "category": "Licensing & Permits", "cost": "Estimated cost in Rupees", "notes": "Required registrations like GST, FSSAI, or trade license" },
      { "category": "Initial Inventory", "cost": "Estimated cost in Rupees", "notes": "Initial raw materials or stock required" },
      { "category": "Working Capital Buffer", "cost": "Estimated cost in Rupees", "notes": "Cash reserve for operating costs during first 3 months" }
    ],
    "total": "Total calculated capital required (e.g., ₹5.5 Lakhs)"
  },
  "competition": {
    "isRisky": true,
    "riskWarning": "Brutally honest, detailed assessment of whether this business is risky or saturated in this locality. For example, if it is a salon, identify major established competitors in India (e.g. Habib's, Jawed Habib, Geetanjali Salon, Enrich, Lakme) or dominant local studios, and clearly warn the user if there is too much competition so a new startup in this category is not generally recommended in this area.",
    "proceedAdvice": "A string containing a list of 3-4 specific mitigation steps separated by newlines (\\n) that they MUST follow if they choose to proceed despite the high risk (e.g., micro-niche services, organic reels hook, localized subscription model). Make it concrete.",
    "pricingLevel": "Low, Medium, or High",
    "competitorTypes": "Detailed description of local competitors in this locality, naming real brand chains or local types",
    "weaknesses": "Observed weaknesses or service gaps of existing competitors in the market",
    "differentiation": "Strategic recommendation to stand out from competitors"
  },
  "businessPlan": {
    "valueProp": "Clear statement of the unique value proposition",
    "customerSegments": "Primary customer demographics in this locality",
    "activities": "Key operations/activities to focus on",
    "revenueStreams": "Primary monetization methods (e.g. direct sales, catering)",
    "costDrivers": "Core monthly operating expenses"
  },
  "marketing": {
    "channels": [
      { "name": "Channel Name (e.g. Instagram Reels)", "detail": "Actionable tip on how to utilize this channel locally" },
      { "name": "Channel Name (e.g. Local SEO)", "detail": "Actionable tip on how to optimize" }
    ],
    "timeline": [
      { "phase": "Week 1", "task": "Immediate step to establish presence" },
      { "phase": "Week 2-3", "task": "Launch setup or local buzz activities" },
      { "phase": "Week 4+", "task": "Ongoing operational growth actions" }
    ]
  }
}`

      const raw = await askAI(system, prompt)
      const result = parseJSON<any>(raw)
      return NextResponse.json({ roadmap: result })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (err: any) {
    console.error('Consultant API Error:', err)
    return NextResponse.json({ error: err.message || 'Failed to process request' }, { status: 500 })
  }
}
