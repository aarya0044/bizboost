# BizBoost — Free Business Intelligence Platform

AI-powered tool for Indian SMBs to analyze physical store locations and grow online.
**Zero cost to run** — uses free-tier AI APIs.

---

## Quick start

```bash
unzip bizboost.zip && cd bizboost
cp .env.example .env.local
# Edit .env.local — add your API key (see below)
npm install
npm run dev
```
Open http://localhost:3000

---

## Choosing a free AI provider

Edit `AI_PROVIDER` in `.env.local`:

| Provider | Free tier | Speed | Sign up |
|---|---|---|---|
| **Groq** (default) | 14,400 req/day, no card | ⚡ Very fast | console.groq.com |
| **Gemini** | 1,500 req/day, 15 rpm | Fast | aistudio.google.com |
| **OpenRouter** | Free credits on signup | Good | openrouter.ai |

### Groq setup (recommended)
```
AI_PROVIDER=groq
GROQ_API_KEY=gsk_...
```

### Gemini setup
```
AI_PROVIDER=gemini
GEMINI_API_KEY=AIza...
```

### OpenRouter setup
```
AI_PROVIDER=openrouter
OPENROUTER_API_KEY=sk-or-...
```

---

## Features

### Location Analyzer (`/location`)
- Viability score (0–100) for your business idea + area
- Footfall, demographic fit, and market gap scores  
- Real competitor data (optional, via Google Places free tier)
- 4 alternative nearby locations with reasons
- Pre-opening action checklist

### Digital & SEO Advisor (`/digital`)
- Live Google PageSpeed audit (completely free, no key needed)
- Tech stack advice — when to move off WordPress
- SEO checklist: schema, backlinks, local citations, mobile
- Primary + long-tail keyword strategy
- Content ideas for organic traffic
- Audience targeting channels (free vs paid)
- Quick wins to act on this week

---

## Deploy free on Vercel

```bash
npm install -g vercel
vercel
```

Add your env vars in Vercel dashboard → Project → Settings → Environment Variables.

---

## Project structure

```
src/
  lib/
    ai.ts                   ← Universal AI client (Groq / Gemini / OpenRouter)
  app/
    page.tsx                ← Landing page
    location/page.tsx       ← Location analyzer UI
    digital/page.tsx        ← SEO advisor UI
    api/
      analyze-location/     ← Location AI route
      analyze-seo/          ← SEO AI route
  components/
    ui/shared.tsx           ← Reusable UI components
```

---

## Optional: Google Places API (real competitor data)

1. Go to console.cloud.google.com  
2. Create project → Enable **Places API** → Create API key  
3. Add to `.env.local`: `NEXT_PUBLIC_GOOGLE_PLACES_API_KEY=AIza...`  
4. User enters it in the Location form (never stored server-side)

Free tier: ~300 searches/month.

---

## Extend it

- **User accounts + history**: add Supabase free tier (`npm install @supabase/supabase-js`)
- **PDF report export**: add `@react-pdf/renderer`
- **More data**: OpenStreetMap Overpass API (amenities), data.gov.in (demographics)

## License
MIT
