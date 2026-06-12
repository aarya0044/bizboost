'use client'
import { useState } from 'react'
import { Globe, CheckCircle, AlertTriangle, XCircle, Loader2, Zap, TrendingUp } from 'lucide-react'
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
  good: <CheckCircle size={16} className="text-brand-500 flex-shrink-0" />,
  warn: <AlertTriangle size={16} className="text-amber-500 flex-shrink-0" />,
  bad: <XCircle size={16} className="text-red-500 flex-shrink-0" />,
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
    impact === 'High' ? 'bg-brand-50 text-brand-700' : impact === 'Medium' ? 'bg-amber-50 text-amber-700' : 'bg-gray-100 text-gray-600'

  return (
    <PageShell active="digital">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-1">Digital & SEO Advisor</h1>
        <p className="text-gray-500 text-sm">Get a live site audit, keyword strategy, platform advice, and audience targeting plan.</p>
      </div>

      <Card className="mb-4">
        <h2 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2"><Globe size={16} /> Your online presence</h2>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <FormField label="Website URL (optional but recommended)">
            <input className={inputClass} placeholder="https://yourbusiness.com" value={form.url} onChange={set('url')} />
          </FormField>
          <FormField label="Current platform / tech stack">
            <select className={selectClass} value={form.platform} onChange={set('platform')}>
              {['WordPress','Wix','Squarespace','Shopify','Custom HTML','React / Next.js','Webflow','Other / Not sure'].map(p => (
                <option key={p}>{p}</option>
              ))}
            </select>
          </FormField>
          <FormField label="Business type *">
            <input className={inputClass} placeholder="e.g. Optical store, clothing boutique" value={form.bizType} onChange={set('bizType')} />
          </FormField>
          <FormField label="Target city / region *">
            <input className={inputClass} placeholder="e.g. Pune, Maharashtra" value={form.city} onChange={set('city')} />
          </FormField>
          <FormField label="Keywords you want to rank for">
            <input className={inputClass} placeholder="e.g. optical store kothrud, eye checkup pune" value={form.keywords} onChange={set('keywords')} />
          </FormField>
          <FormField label="Main online competitors">
            <input className={inputClass} placeholder="e.g. lenskart.com, specsmakers.in" value={form.competitors} onChange={set('competitors')} />
          </FormField>
        </div>

        {error && <p className="text-sm text-red-500 mb-3">{error}</p>}

        <button
          onClick={analyze}
          disabled={loading}
          className="flex items-center gap-2 bg-brand-500 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-brand-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? <><Loader2 size={15} className="animate-spin" /> Analyzing…</> : <><TrendingUp size={15} /> Get full digital plan</>}
        </button>
        {form.url && <p className="text-xs text-gray-400 mt-2">We'll run a free Google PageSpeed audit on your URL.</p>}
      </Card>

      {loading && (
        <div className="text-center py-16 text-gray-400">
          <Loader2 size={32} className="animate-spin mx-auto mb-3 text-brand-400" />
          <p className="text-sm">Running PageSpeed audit and building your digital strategy…</p>
        </div>
      )}

      {result && (
        <div className="space-y-4 fade-in">
          {/* Overall score */}
          <Card>
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Overall digital health</h2>
            <div className="flex items-center gap-5">
              <ScoreRing score={result.overallScore} />
              <div>
                <p className="text-base font-medium text-gray-800 mb-1">Digital presence score</p>
                <p className="text-sm text-gray-500">Based on platform, SEO signals, keyword coverage, and audience reach strategy.</p>
              </div>
            </div>
          </Card>

          {/* PageSpeed */}
          {speedData && (
            <Card>
              <h2 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <Zap size={15} className="text-amber-500" /> Live PageSpeed audit (mobile)
              </h2>
              <div className="grid grid-cols-4 gap-3 mb-4">
                <MetricCard label="Performance" value={speedData.performance} />
                <MetricCard label="SEO score" value={speedData.seo} />
                <MetricCard label="Accessibility" value={speedData.accessibility} />
                <MetricCard label="Best practices" value={speedData.bestPractices} />
              </div>
              <div className="flex gap-4 text-xs text-gray-500 flex-wrap">
                <span>FCP: <strong className="text-gray-700">{speedData.fcp}</strong></span>
                <span>LCP: <strong className="text-gray-700">{speedData.lcp}</strong></span>
                <span>CLS: <strong className="text-gray-700">{speedData.cls}</strong></span>
                <span>Mobile friendly: <strong className={speedData.mobileUsable ? 'text-brand-600' : 'text-red-500'}>{speedData.mobileUsable ? 'Yes ✓' : 'No ✗'}</strong></span>
              </div>
            </Card>
          )}

          {/* Platform */}
          <Card>
            <h2 className="text-sm font-semibold text-gray-700 mb-3">Tech stack / platform</h2>
            <InsightBlock
              type={result.platformRecommendation.shouldMigrate ? 'warn' : 'good'}
              title={result.platformRecommendation.shouldMigrate ? `Consider migrating from ${form.platform}` : `${form.platform} is working well`}
              text={result.platformRecommendation.currentIssues}
            />
            {result.platformRecommendation.shouldMigrate && (
              <div className="bg-brand-50 border border-brand-100 rounded-xl p-4 mt-3">
                <p className="text-sm font-medium text-brand-700 mb-1">Recommended: {result.platformRecommendation.recommendedStack}</p>
                <p className="text-sm text-brand-600 mb-1">{result.platformRecommendation.migrationBenefit}</p>
                <p className="text-xs text-brand-500">Effort estimate: {result.platformRecommendation.estimatedEffort}</p>
              </div>
            )}
          </Card>

          {/* SEO checklist */}
          <Card>
            <h2 className="text-sm font-semibold text-gray-700 mb-4">SEO checklist</h2>
            <div className="space-y-2">
              {result.seoChecks.map((check, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                  {statusIcon[check.status]}
                  <div>
                    <span className="text-sm font-medium text-gray-800">{check.label}</span>
                    <span className="text-sm text-gray-500"> — {check.detail}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Keyword strategy */}
          <Card>
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Keyword strategy</h2>
            <div className="mb-4">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Primary keywords</p>
              <div className="flex flex-wrap gap-2">
                {result.keywordStrategy.primaryKeywords.map(k => (
                  <span key={k} className="bg-brand-50 text-brand-700 border border-brand-100 rounded-full px-3 py-1 text-xs font-medium">{k}</span>
                ))}
              </div>
            </div>
            <div className="mb-4">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Long-tail keywords (easier to rank for)</p>
              <div className="flex flex-wrap gap-2">
                {result.keywordStrategy.longTailKeywords.map(k => (
                  <span key={k} className="bg-blue-50 text-blue-700 border border-blue-100 rounded-full px-3 py-1 text-xs">{k}</span>
                ))}
              </div>
            </div>
            <div className="border-t border-gray-50 pt-4">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">Content ideas to attract organic traffic</p>
              <div className="space-y-2">
                {result.keywordStrategy.contentIdeas.map((idea, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-xs font-semibold flex-shrink-0 mt-0.5">{i + 1}</span>
                    <div>
                      <p className="text-sm font-medium text-gray-800">{idea.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{idea.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Audience targeting */}
          <Card>
            <h2 className="text-sm font-semibold text-gray-700 mb-2">Audience targeting</h2>
            <p className="text-sm text-gray-500 mb-4 leading-relaxed">{result.audienceTargeting.primaryAudience}</p>
            <div className="space-y-3">
              {result.audienceTargeting.channels.map((ch, i) => (
                <div key={i} className="flex items-start justify-between gap-4 border border-gray-100 rounded-xl p-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-gray-800">{ch.name}</span>
                      {ch.free && <span className="text-xs bg-brand-50 text-brand-600 rounded-full px-2 py-0.5 border border-brand-100">Free</span>}
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed">{ch.tip}</p>
                  </div>
                  <div className="flex flex-col gap-1 flex-shrink-0 text-right">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${impactColor(ch.impact)}`}>
                      {ch.impact} impact
                    </span>
                    <span className="text-xs text-gray-400">{ch.effort} effort</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Quick wins */}
          <Card>
            <h2 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <Zap size={15} className="text-amber-500" /> Quick wins — do these this week
            </h2>
            <div className="space-y-3">
              {result.quickWins.map((win, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center text-xs font-semibold flex-shrink-0 mt-0.5">{i + 1}</span>
                  <p className="text-sm text-gray-700 leading-relaxed">{win}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </PageShell>
  )
}
