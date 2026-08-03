'use client'
import { useState } from 'react'
import { Globe, CheckCircle, AlertTriangle, XCircle, Loader2, Zap } from 'lucide-react'
import {
  PageShell, Card, ScoreRing, MetricCard, InsightBlock,
  FormField, inputClass, selectClass
} from '@/components/ui/shared'

interface SpeedData {
  performance: number
  seo: number
  accessibility: number
  bestPractices: number
  fcp: string
  lcp: string
  cls: string
  mobileUsable: boolean
}

interface SEOResult {
  overallScore: number
  platformRecommendation: {
    shouldMigrate: boolean
    currentIssues: string
    recommendedStack: string
    migrationBenefit: string
    estimatedEffort: string
  }
  seoChecks: { status: 'good' | 'warn' | 'bad'; label: string; detail: string }[]
  keywordStrategy: {
    primaryKeywords: string[]
    longTailKeywords: string[]
    contentIdeas: { title: string; desc: string }[]
  }
  audienceTargeting: {
    primaryAudience: string
    channels: { name: string; effort: string; impact: string; free: boolean; tip: string }[]
  }
  quickWins: string[]
}

const statusIcon = {
  good: <CheckCircle size={15} className="text-teal-600 flex-shrink-0" />,
  warn: <AlertTriangle size={15} className="text-amber-600 flex-shrink-0" />,
  bad: <XCircle size={15} className="text-red-600 flex-shrink-0" />,
}

export default function DigitalPage() {
  const [form, setForm] = useState({ url: '', platform: 'WordPress', bizType: '', city: '', keywords: '', competitors: '' })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<SEOResult | null>(null)
  const [speedData, setSpeedData] = useState<SpeedData | null>(null)
  const [error, setError] = useState('')

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  async function analyze() {
    if (!form.bizType || !form.city) { setError('Please enter business type and city.'); return }
    setError('')
    setLoading(true)
    setResult(null)
    setSpeedData(null)
    try {
      const res = await fetch('/api/analyze-seo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setResult(data.result)
      setSpeedData(data.speedData)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const impactColor = (impact: string) =>
    impact === 'High' 
      ? 'bg-teal-50 text-teal-800 border border-teal-200' 
      : impact === 'Medium' 
      ? 'bg-amber-50 text-amber-800 border border-amber-200' 
      : 'bg-slate-100 text-slate-700 border border-slate-200'

  return (
    <PageShell active="digital">
      <div className="mb-8 font-sans">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-1">Digital & SEO Advisor</h1>
        <p className="text-slate-500 text-xs mt-1.5 leading-relaxed font-medium">Get a live site speed audit, keyword strategy, platform migration advice, and target audience plan.</p>
      </div>

      <Card className="mb-6 animate-scale-in">
        <h2 className="text-sm font-bold text-slate-800 mb-5 flex items-center gap-2 border-b border-slate-100 pb-3"><Globe size={16} className="text-teal-600" /> Your Online Presence</h2>
        <div className="grid grid-cols-2 gap-5 mb-5">
          <FormField label="Website URL (optional)">
            <input className={inputClass} placeholder="https://yourbusiness.com" value={form.url} onChange={set('url')} />
          </FormField>
          <FormField label="Current platform / tech stack">
            <select className={selectClass} value={form.platform} onChange={set('platform')}>
              {['WordPress','Wix','Squarespace','Shopify','Custom HTML','React / Next.js','Webflow','Other / Not sure'].map(p => (
                <option key={p} className="bg-white text-slate-900">{p}</option>
              ))}
            </select>
          </FormField>
          <FormField label="Business type *">
            <input className={inputClass} placeholder="e.g. Optical Store" value={form.bizType} onChange={set('bizType')} />
          </FormField>
          <FormField label="Target city / area *">
            <input className={inputClass} placeholder="e.g. Kothrud, Pune" value={form.city} onChange={set('city')} />
          </FormField>
          <FormField label="Target keywords (comma separated)">
            <input className={inputClass} placeholder="e.g. eye clinic pune, buy frames online" value={form.keywords} onChange={set('keywords')} />
          </FormField>
          <FormField label="Top competitors (comma separated)">
            <input className={inputClass} placeholder="e.g. Lawrence & Mayo, GKB Opticals" value={form.competitors} onChange={set('competitors')} />
          </FormField>
        </div>

        {form.url && <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-4">We will run a free, live Google PageSpeed audit on your website.</p>}

        {error && <p className="text-xs font-semibold text-red-500 mb-4">{error}</p>}

        <button
          onClick={analyze}
          disabled={loading}
          className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-5 py-3.5 rounded-xl text-xs font-bold transition-all shadow-lg shadow-teal-500/10 active:scale-98"
        >
          {loading ? <><Loader2 size={14} className="animate-spin" /> Auditing Site…</> : <><Globe size={14} /> Run Digital Audit</>}
        </button>
      </Card>

      {loading && (
        <div className="text-center py-16 text-slate-550 bg-slate-50 border border-slate-100 rounded-2xl animate-pulse-glow font-medium">
          <Loader2 size={32} className="animate-spin mx-auto mb-3 text-teal-600" />
          <p className="text-xs">Running Lighthouse audits, computing SEO metrics, and compiling marketing gaps…</p>
        </div>
      )}

      {result && (
        <div className="space-y-6 animate-fade-in-up">
          {/* Overall digital score */}
          <Card>
            <h2 className="text-sm font-bold text-slate-800 mb-5 border-b border-slate-100 pb-3">Overall Digital Health</h2>
            <div className="flex items-center gap-5">
              <ScoreRing score={result.overallScore} />
              <div>
                <p className="text-sm font-bold text-slate-900 mb-1">Digital Presence Score</p>
                <p className="text-xs text-slate-500 max-w-sm leading-relaxed font-medium">Based on platform technology, Core Web Vitals performance, local keyword coverage, and audience reach.</p>
              </div>
            </div>
          </Card>

          {/* Speed data */}
          {speedData && (
            <Card>
              <h2 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-1.5 border-b border-slate-100 pb-3">
                <Zap size={15} className="text-teal-600" /> Live Lighthouse Performance (via PageSpeed API)
              </h2>
              <div className="grid grid-cols-4 gap-4 mb-5">
                <MetricCard label="Performance" value={speedData.performance} />
                <MetricCard label="SEO score" value={speedData.seo} />
                <MetricCard label="Accessibility" value={speedData.accessibility} />
                <MetricCard label="Best practices" value={speedData.bestPractices} />
              </div>
              <div className="flex gap-4 text-[10px] text-slate-500 flex-wrap bg-slate-50 border border-slate-200/50 p-3 rounded-xl font-bold">
                <span>FCP: <strong className="text-slate-800">{speedData.fcp}</strong></span>
                <span>LCP: <strong className="text-slate-800">{speedData.lcp}</strong></span>
                <span>CLS: <strong className="text-slate-800">{speedData.cls}</strong></span>
                <span>Mobile Usability: <strong className={speedData.mobileUsable ? 'text-teal-600' : 'text-red-600'}>{speedData.mobileUsable ? 'Pass' : 'Fail'}</strong></span>
              </div>
            </Card>
          )}

          {/* Tech stack / platform advice */}
          <Card>
            <h2 className="text-sm font-bold text-slate-800 mb-5 border-b border-slate-100 pb-3">Platform Tech Audit</h2>
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Current stack issues</p>
                  <p className="text-xs text-slate-650 leading-relaxed font-medium">{result.platformRecommendation.currentIssues}</p>
                </div>
                <div className="bg-slate-50 border border-slate-100 px-3.5 py-2 rounded-xl text-center flex-shrink-0 shadow-sm">
                  <span className="text-[9px] text-slate-400 uppercase tracking-wider font-bold block mb-0.5">Migration Effort</span>
                  <span className="text-xs text-teal-600 font-extrabold">{result.platformRecommendation.estimatedEffort}</span>
                </div>
              </div>
              <div className="p-4 bg-teal-50 border border-teal-200 rounded-xl">
                <span className="text-[10px] text-teal-700 font-bold uppercase tracking-wider block mb-1">Recommended Stack</span>
                <p className="text-xs text-slate-900 leading-relaxed font-bold mb-2">{result.platformRecommendation.recommendedStack}</p>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">{result.platformRecommendation.migrationBenefit}</p>
              </div>
            </div>
          </Card>

          {/* SEO Checks */}
          <Card>
            <h2 className="text-sm font-bold text-slate-800 mb-5 border-b border-slate-100 pb-3">Technical SEO Checklist</h2>
            <div className="space-y-3.5">
              {result.seoChecks.map((check, i) => (
                <div key={i} className="flex gap-3 items-start bg-slate-50/50 border border-slate-100 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                  {statusIcon[check.status]}
                  <div>
                    <span className="text-xs font-bold text-slate-800">{check.label}</span>
                    <p className="text-xs text-slate-550 leading-relaxed mt-1 font-medium">{check.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Keywords */}
          <Card>
            <h2 className="text-sm font-bold text-slate-800 mb-5 border-b border-slate-100 pb-3">Keyword & Content Strategy</h2>
            <div className="space-y-5">
              <div>
                <p className="text-[10px] font-bold text-teal-700 uppercase tracking-widest mb-2.5">Primary Keywords</p>
                <div className="flex flex-wrap gap-2">
                  {result.keywordStrategy.primaryKeywords.map((kw, i) => (
                    <span key={i} className="text-xs bg-teal-50 border border-teal-200 text-teal-800 px-3 py-1.5 rounded-xl font-bold">{kw}</span>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[10px] font-bold text-slate-450 uppercase tracking-widest mb-2.5">Long-Tail Opportunities (Lower competition)</p>
                <div className="flex flex-wrap gap-2">
                  {result.keywordStrategy.longTailKeywords.map((kw, i) => (
                    <span key={i} className="text-xs bg-slate-100 border border-slate-200/50 text-slate-650 px-3 py-1.5 rounded-xl font-semibold">{kw}</span>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[10px] font-bold text-teal-700 uppercase tracking-widest mb-3.5">Suggested Content Campaigns</p>
                <div className="space-y-3">
                  {result.keywordStrategy.contentIdeas.map((idea, i) => (
                    <div key={i} className="bg-slate-50 border border-slate-200 p-4 rounded-xl hover:bg-slate-100 transition-all">
                      <p className="text-xs font-bold text-slate-800">{idea.title}</p>
                      <p className="text-[11px] text-slate-500 mt-1 leading-relaxed font-medium">{idea.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* Audience targeting */}
          <Card>
            <h2 className="text-sm font-bold text-slate-800 mb-2">Target Market Segments</h2>
            <p className="text-xs text-slate-500 mb-5 leading-relaxed font-medium">{result.audienceTargeting.primaryAudience}</p>
            <div className="space-y-3.5">
              {result.audienceTargeting.channels.map((ch, i) => (
                <div key={i} className="bg-slate-50 border border-slate-150 p-4 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-slate-200 transition-colors shadow-sm">
                  <div className="max-w-md">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-xs font-bold text-slate-800">{ch.name}</span>
                      {ch.free && <span className="text-[8px] bg-teal-50 border border-teal-200 text-teal-700 px-2 py-0.5 rounded uppercase font-bold">Organic</span>}
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed font-medium">{ch.tip}</p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0 self-end md:self-auto">
                    <span className={`text-[9px] border px-2.5 py-1 rounded-lg font-bold ${impactColor(ch.impact)}`}>Impact: {ch.impact}</span>
                    <span className="text-[9px] bg-slate-100 border border-slate-200/50 text-slate-600 px-2.5 py-1 rounded-lg font-bold">{ch.effort} effort</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Quick wins */}
          <Card>
            <h2 className="text-sm font-bold text-slate-800 mb-5 border-b border-slate-100 pb-3">Quick Wins (First 30 days)</h2>
            <div className="space-y-3">
              {result.quickWins.map((win, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="w-5.5 h-5.5 rounded-full bg-teal-50 border border-teal-200 text-teal-600 flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <p className="text-xs text-slate-650 leading-relaxed font-medium">{win}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </PageShell>
  )
}
