import { NextRequest, NextResponse } from 'next/server'
import { askAI, parseJSON } from '@/lib/ai'

async function fetchPageSpeed(url: string) {
  if (!url || !url.startsWith('http')) return null
  try {
    const api = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&strategy=mobile`
    const res = await fetch(api, { cache: 'no-store' })
    const data = await res.json()
    const cats   = data.lighthouseResult?.categories
    const audits = data.lighthouseResult?.audits
    return {
      performance:   Math.round((cats?.performance?.score   ?? 0) * 100),
      seo:           Math.round((cats?.seo?.score           ?? 0) * 100),
      accessibility: Math.round((cats?.accessibility?.score ?? 0) * 100),
      bestPractices: Math.round((cats?.['best-practices']?.score ?? 0) * 100),
      fcp:  audits?.['first-contentful-paint']?.displayValue     ?? 'N/A',
      lcp:  audits?.['largest-contentful-paint']?.displayValue   ?? 'N/A',
      cls:  audits?.['cumulative-layout-shift']?.displayValue    ?? 'N/A',
      mobileUsable: audits?.['viewport']?.score === 1,
    }
  } catch {
    return null
  }
}

export async function POST(req: NextRequest) {
  try {
    const { url, platform, bizType, city, keywords, competitors } = await req.json()
    if (!bizType || !city) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

    const speedData = url ? await fetchPageSpeed(url) : null

    const speedContext = speedData
      ? `Live PageSpeed data (mobile):
- Performance: ${speedData.performance}/100  SEO: ${speedData.seo}/100
- Accessibility: ${speedData.accessibility}/100  Best Practices: ${speedData.bestPractices}/100
- FCP: ${speedData.fcp}  LCP: ${speedData.lcp}  CLS: ${speedData.cls}
- Mobile friendly: ${speedData.mobileUsable}`
      : 'No website URL — give general recommendations.'

    const system = `You are a senior SEO and digital marketing consultant specialising in Indian local
businesses and SMBs. Return ONLY raw JSON — no markdown fences, no preamble.`

    const prompt = `Digital strategy for an Indian local business:
Business: ${bizType}
City: ${city}
Platform: ${platform}
Website: ${url || 'None'}
Keywords: ${keywords || 'Not specified'}
Competitors: ${competitors || 'Not specified'}
${speedContext}

Return this EXACT JSON shape:
{
  "overallScore": 58,
  "platformRecommendation": {
    "shouldMigrate": true,
    "currentIssues": "1-2 sentences on why current platform limits SEO",
    "recommendedStack": "Next.js + Vercel",
    "migrationBenefit": "1 sentence",
    "estimatedEffort": "2-3 weeks with a developer"
  },
  "seoChecks": [
    {"status":"good","label":"Google Business Profile","detail":"What to do"},
    {"status":"warn","label":"Page loading speed","detail":"Issue and fix"},
    {"status":"bad","label":"Schema markup","detail":"What to add"},
    {"status":"good","label":"Mobile optimisation","detail":"Status"},
    {"status":"warn","label":"Local citations (NAP)","detail":"What to check"},
    {"status":"bad","label":"Backlink profile","detail":"Strategy"}
  ],
  "keywordStrategy": {
    "primaryKeywords": ["kw1","kw2","kw3"],
    "longTailKeywords": ["lt1","lt2","lt3","lt4","lt5"],
    "contentIdeas": [
      {"title":"Page/blog title","desc":"Why it drives traffic"},
      {"title":"Page/blog title","desc":"Why it drives traffic"},
      {"title":"Page/blog title","desc":"Why it drives traffic"}
    ]
  },
  "audienceTargeting": {
    "primaryAudience": "Detailed description",
    "channels": [
      {"name":"Google My Business","effort":"Low","impact":"High","free":true,"tip":"Actionable tip"},
      {"name":"Instagram Reels","effort":"Medium","impact":"High","free":true,"tip":"Actionable tip"},
      {"name":"WhatsApp Business","effort":"Low","impact":"Medium","free":true,"tip":"Actionable tip"},
      {"name":"Google Ads","effort":"Low","impact":"High","free":false,"tip":"Tip with budget guidance"}
    ]
  },
  "quickWins": [
    "Do this week — specific action",
    "Second quick win",
    "Third quick win",
    "Fourth quick win"
  ]
}`

    const raw = await askAI(system, prompt)
    const result = parseJSON(raw)
    return NextResponse.json({ result, speedData })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
