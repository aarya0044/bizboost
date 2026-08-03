'use client'
import { useState, useEffect } from 'react'
import { MapPin, Building2, Star, ChevronRight, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import {
  PageShell, Card, ScoreRing, MetricCard, InsightBlock, VerdictBadge,
  FormField, inputClass
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
  const [user, setUser] = useState<any>(null)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    setSaveStatus('idle')
  }, [result])

  async function saveReport() {
    if (!result || !user) return
    setSaveStatus('saving')
    try {
      const { error } = await supabase.from('saved_scans').insert([{
        user_id: user.id,
        biz_type: form.bizType,
        location: form.location,
        viability_score: result.viabilityScore,
        verdict: result.verdict,
        details: result
      }])
      if (error) throw error
      setSaveStatus('saved')
    } catch (err) {
      console.error('Error saving scan:', err)
      setSaveStatus('error')
    }
  }

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
      <div className="mb-8 font-sans">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-1">Location Analyzer</h1>
        <p className="text-slate-500 text-xs mt-1.5 leading-relaxed font-medium">Find out if your business idea will thrive in a specific area — and where else to look if not.</p>
      </div>

      <Card className="mb-6 animate-scale-in">
        <h2 className="text-sm font-bold text-slate-800 mb-5 flex items-center gap-2 border-b border-slate-100 pb-3"><Building2 size={16} className="text-teal-650" /> Your Business Profile</h2>
        <div className="grid grid-cols-2 gap-5 mb-5">
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

        <details className="mb-6 group">
          <summary className="text-[10px] text-slate-400 cursor-pointer hover:text-slate-800 select-none font-bold uppercase tracking-wider transition-colors">
            + Add Google Places API key for real competitor data (optional)
          </summary>
          <div className="mt-4 p-4.5 bg-slate-50 border border-slate-100 rounded-xl animate-fade-in-up">
            <FormField label="Google Places API key">
              <input type="password" className={inputClass} placeholder="AIza..." value={form.placesApiKey} onChange={set('placesApiKey')} />
            </FormField>
            <p className="text-[10px] text-slate-500 mt-2 leading-relaxed font-medium">
              Get a free key at <a href="https://console.cloud.google.com" target="_blank" rel="noreferrer" className="text-teal-600 hover:underline font-semibold">console.cloud.google.com</a>. Enable the Places API and create an API key.
              Without it, the AI uses its internal city knowledge.
            </p>
          </div>
        </details>

        {error && <p className="text-xs font-semibold text-red-500 mb-4">{error}</p>}

        <button
          onClick={analyze}
          disabled={loading}
          className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-5 py-3.5 rounded-xl text-xs font-bold transition-all shadow-lg shadow-teal-500/10 active:scale-98"
        >
          {loading ? <><Loader2 size={14} className="animate-spin" /> Analyzing…</> : <><MapPin size={14} /> Analyze this location</>}
        </button>
      </Card>

      {loading && (
        <div className="text-center py-16 text-slate-500 bg-slate-50 border border-slate-100 rounded-2xl animate-pulse-glow">
          <Loader2 size={32} className="animate-spin mx-auto mb-3 text-teal-600" />
          <p className="text-xs font-medium">Checking competitor density, local demographics, and market signals…</p>
        </div>
      )}

      {result && (
        <div className="space-y-6 animate-fade-in-up">
          {/* Score overview */}
          <Card>
            <h2 className="text-sm font-bold text-slate-800 mb-5 border-b border-slate-100 pb-3">Location verdict — {form.location}</h2>
            <div className="flex items-center gap-5 mb-6">
              <ScoreRing score={result.viabilityScore} />
              <div>
                <VerdictBadge score={result.viabilityScore} verdict={result.verdict} />
                <p className="text-xs text-slate-500 mt-2.5 max-w-md leading-relaxed font-medium">{result.verdictReason}</p>
                {user ? (
                  <button
                    onClick={saveReport}
                    disabled={saveStatus === 'saving' || saveStatus === 'saved'}
                    className="mt-4 flex items-center gap-1.5 px-3 py-1.5 bg-teal-50 border border-teal-200 hover:bg-teal-100/70 disabled:opacity-50 text-teal-800 font-bold text-[10px] rounded-lg transition-all active:scale-95"
                  >
                    {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? 'Saved to Dashboard' : 'Save Report to Dashboard'}
                  </button>
                ) : (
                  <p className="text-[10px] text-slate-400 mt-4 font-bold uppercase tracking-wider">Sign in to save this analysis to your account.</p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 border-t border-slate-100 pt-5">
              <MetricCard label="Footfall potential" value={result.footfallScore} />
              <MetricCard label="Demographic fit" value={result.demographicMatch} />
              <MetricCard label="Market gap" value={result.marketGap} />
            </div>
          </Card>

          {/* Key insights */}
          <Card>
            <h2 className="text-sm font-bold text-slate-800 mb-4.5">Core Market Insights</h2>
            {result.keyInsights.map((ins, i) => (
              <InsightBlock key={i} type={ins.type} title={ins.title} text={ins.text} />
            ))}
          </Card>

          {/* Competitors */}
          {competitors && competitors.length > 0 && (
            <Card>
              <h2 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
                <Star size={15} className="text-amber-500" /> Nearby Competitors (Google Places API)
              </h2>
              <div className="space-y-3">
                {competitors.map((c, i) => (
                  <div key={i} className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0 hover:bg-slate-50/50 px-2.5 rounded-lg transition-colors">
                    <div>
                      <p className="text-xs font-bold text-slate-800">{c.name}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5 font-medium">{c.address}</p>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-amber-700 font-bold flex-shrink-0 ml-3 bg-amber-50 border border-amber-200 px-2 py-1 rounded-lg">
                      <Star size={12} fill="currentColor" className="text-amber-500" />
                      {c.rating}
                      <span className="text-slate-400 font-normal">({c.total})</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Alternative locations */}
          <Card>
            <h2 className="text-sm font-bold text-slate-800 mb-1">Alternative Areas to Consider</h2>
            <p className="text-[10px] text-slate-400 mb-4.5 font-bold uppercase tracking-wider">Nearby locations with potential demand and market gaps</p>
            <div className="grid grid-cols-2 gap-4">
              {result.alternativeLocations.map((loc, i) => (
                <div
                  key={i}
                  onClick={() => setForm(f => ({ ...f, location: loc.name }))}
                  className="border border-slate-200/60 bg-white hover:border-teal-500/25 hover:bg-slate-50/30 rounded-xl p-4 cursor-pointer transition-all duration-300 group hover:-translate-y-0.5 shadow-sm"
                >
                  <div className="flex items-start justify-between mb-1.5">
                    <p className="text-xs font-bold text-slate-800 group-hover:text-teal-600 transition-colors">{loc.name}</p>
                    <span className="text-[10px] text-slate-400 ml-2 flex-shrink-0 font-bold">{loc.distance}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed font-medium">{loc.reason}</p>
                  <div className="flex items-center gap-1 text-[10px] text-teal-600 mt-3.5 font-bold uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">
                    Analyze this spot <ChevronRight size={11} />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Actions */}
          <Card>
            <h2 className="text-sm font-bold text-slate-800 mb-5 border-b border-slate-100 pb-3">Pre-Launch Actions</h2>
            <div className="space-y-3.5">
              {result.topActions.map((action, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="w-5.5 h-5.5 rounded-full bg-teal-50 border border-teal-100 text-teal-600 flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <p className="text-xs text-slate-650 leading-relaxed">{action}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </PageShell>
  )
}
