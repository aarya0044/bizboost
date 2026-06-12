'use client'
import { useState } from 'react'
import { MapPin, Building2, Star, ChevronRight, Loader2 } from 'lucide-react'
import {
  PageShell, Card, ScoreRing, MetricCard, InsightBlock, VerdictBadge,
  FormField, inputClass, textareaClass
} from '@/components/ui/shared'

interface LocationResult {
  viabilityScore: number
  verdict: string
  verdictReason: string
  footfallScore: number
  demographicMatch: number
  marketGap: number
  keyInsights: { type: 'good' | 'warn' | 'bad'; title: string; text: string }[]
  alternativeLocations: { name: string; distance: string; reason: string }[]
  topActions: string[]
}

interface Competitor {
  name: string
  rating: number | string
  total: number
  address: string
}

export default function LocationPage() {
  const [form, setForm] = useState({ bizType: '', location: '', usp: '', customers: '', placesApiKey: '' })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<LocationResult | null>(null)
  const [competitors, setCompetitors] = useState<Competitor[] | null>(null)
  const [error, setError] = useState('')

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  async function analyze() {
    if (!form.bizType || !form.location) { setError('Please enter business type and location.'); return }
    setError('')
    setLoading(true)
    setResult(null)
    setCompetitors(null)
    try {
      const res = await fetch('/api/analyze-location', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setResult(data.result)
      setCompetitors(data.competitors)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageShell active="location">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-1">Location Analyzer</h1>
        <p className="text-gray-500 text-sm">Find out if your business idea will thrive in a specific area — and where else to look if not.</p>
      </div>

      <Card className="mb-4">
        <h2 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2"><Building2 size={16} /> Your business details</h2>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <FormField label="Business type or name *">
            <input className={inputClass} placeholder="e.g. Optical store, Lenskart franchise" value={form.bizType} onChange={set('bizType')} />
          </FormField>
          <FormField label="Target location *">
            <input className={inputClass} placeholder="e.g. Kothrud, Pune" value={form.location} onChange={set('location')} />
          </FormField>
          <FormField label="Services & USP">
            <input className={inputClass} placeholder="e.g. Free eye checkup, branded frames, home delivery" value={form.usp} onChange={set('usp')} />
          </FormField>
          <FormField label="Target customers">
            <input className={inputClass} placeholder="e.g. Working professionals aged 25–45" value={form.customers} onChange={set('customers')} />
          </FormField>
        </div>

        <details className="mb-4">
          <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-600 select-none">
            + Add Google Places API key for real competitor data (optional, free tier)
          </summary>
          <div className="mt-3">
            <FormField label="Google Places API key">
              <input type="password" className={inputClass} placeholder="AIza..." value={form.placesApiKey} onChange={set('placesApiKey')} />
            </FormField>
            <p className="text-xs text-gray-400 mt-1.5">
              Get a free key at <span className="text-blue-500">console.cloud.google.com</span> → Enable "Places API" → Create credentials.
              Without it, AI uses its own city knowledge.
            </p>
          </div>
        </details>

        {error && <p className="text-sm text-red-500 mb-3">{error}</p>}

        <button
          onClick={analyze}
          disabled={loading}
          className="flex items-center gap-2 bg-brand-500 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-brand-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? <><Loader2 size={15} className="animate-spin" /> Analyzing…</> : <><MapPin size={15} /> Analyze this location</>}
        </button>
      </Card>

      {loading && (
        <div className="text-center py-16 text-gray-400">
          <Loader2 size={32} className="animate-spin mx-auto mb-3 text-brand-400" />
          <p className="text-sm">Checking competitors, demographics, and market signals…</p>
        </div>
      )}

      {result && (
        <div className="space-y-4 fade-in">
          {/* Score overview */}
          <Card>
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Location verdict — {form.location}</h2>
            <div className="flex items-center gap-5 mb-4">
              <ScoreRing score={result.viabilityScore} />
              <div>
                <VerdictBadge score={result.viabilityScore} verdict={result.verdict} />
                <p className="text-sm text-gray-500 mt-2 max-w-sm">{result.verdictReason}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <MetricCard label="Footfall potential" value={result.footfallScore} />
              <MetricCard label="Demographic fit" value={result.demographicMatch} />
              <MetricCard label="Market gap" value={result.marketGap} />
            </div>
          </Card>

          {/* Key insights */}
          <Card>
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Key insights</h2>
            {result.keyInsights.map((ins, i) => (
              <InsightBlock key={i} type={ins.type} title={ins.title} text={ins.text} />
            ))}
          </Card>

          {/* Competitors */}
          {competitors && competitors.length > 0 && (
            <Card>
              <h2 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Star size={15} className="text-amber-400" /> Nearby competitors (live from Google)
              </h2>
              <div className="space-y-2">
                {competitors.map((c, i) => (
                  <div key={i} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-gray-800">{c.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{c.address}</p>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-amber-500 font-medium flex-shrink-0 ml-3">
                      <Star size={13} fill="currentColor" />
                      {c.rating}
                      <span className="text-gray-400 font-normal">({c.total})</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Alternative locations */}
          <Card>
            <h2 className="text-sm font-semibold text-gray-700 mb-1">Alternative locations to consider</h2>
            <p className="text-xs text-gray-400 mb-4">Nearby areas that might offer better growth potential within a few km</p>
            <div className="grid grid-cols-2 gap-3">
              {result.alternativeLocations.map((loc, i) => (
                <div key={i} className="border border-gray-100 hover:border-brand-300 rounded-xl p-3.5 cursor-pointer transition-colors group">
                  <div className="flex items-start justify-between mb-1">
                    <p className="text-sm font-medium text-gray-800">{loc.name}</p>
                    <span className="text-xs text-gray-400 ml-2 flex-shrink-0">{loc.distance}</span>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed">{loc.reason}</p>
                  <div className="flex items-center gap-1 text-xs text-brand-500 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    Analyze this spot <ChevronRight size={12} />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Actions */}
          <Card>
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Before you open — do these first</h2>
            <div className="space-y-3">
              {result.topActions.map((action, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center text-xs font-semibold flex-shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <p className="text-sm text-gray-700 leading-relaxed">{action}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </PageShell>
  )
}
