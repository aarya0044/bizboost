'use client'
import { useState, useEffect } from 'react'
import { PageShell, Card, FormField, inputClass, selectClass } from '@/components/ui/shared'
import { Loader2, ArrowRight, ArrowLeft, RotateCcw, CheckCircle2, AlertTriangle, Briefcase, DollarSign, Target, Radio, Layers } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface Suggestion {
  name: string
  reason: string
  targetAudience: string
  demand: string
}

interface CostItem {
  category: string
  cost: string
  notes: string
}

interface Roadmap {
  startupCost: {
    items: CostItem[]
    total: string
  }
  competition: {
    pricingLevel: string
    competitorTypes: string
    weaknesses: string
    differentiation: string
    isRisky?: boolean
    riskWarning?: string
    proceedAdvice?: string
  }
  businessPlan: {
    valueProp: string
    customerSegments: string
    activities: string
    revenueStreams: string
    costDrivers: string
  }
  marketing: {
    channels: { name: string; detail: string }[]
    timeline: { phase: string; task: string }[]
  }
}

export default function ConsultantPage() {
  const [step, setStep] = useState(1)
  const [maxStepReached, setMaxStepReached] = useState(1)
  const [locality, setLocality] = useState('')
  const [budget, setBudget] = useState('Medium')
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [selectedBusiness, setSelectedBusiness] = useState('')
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null)
  const [loading, setLoading] = useState(false)
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
  }, [roadmap])

  async function saveRoadmap() {
    if (!roadmap || !user) return
    setSaveStatus('saving')
    try {
      const { error } = await supabase.from('saved_roadmaps').insert([{
        user_id: user.id,
        biz_type: selectedBusiness,
        locality: locality,
        budget: budget,
        roadmap: roadmap
      }])
      if (error) throw error
      setSaveStatus('saved')
    } catch (err) {
      console.error('Error saving roadmap:', err)
      setSaveStatus('error')
    }
  }

  const budgetOptions = ['Low Budget', 'Medium Budget', 'High Budget']

  const stepsList = [
    { num: 1, name: 'Locality', icon: <Layers size={13} /> },
    { num: 2, name: 'Suggestions', icon: <Briefcase size={13} /> },
    { num: 3, name: 'Startup Cost', icon: <DollarSign size={13} /> },
    { num: 4, name: 'Competition', icon: <AlertTriangle size={13} /> },
    { num: 5, name: 'Lean Plan', icon: <Target size={13} /> },
    { num: 6, name: 'Marketing', icon: <Radio size={13} /> }
  ]

  async function fetchSuggestions() {
    if (!locality) {
      setError('Please specify target locality name.')
      return
    }
    setError('')
    setLoading(true)
    setSuggestions([])
    try {
      const res = await fetch('/api/consultant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'suggestions', locality, budget }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setSuggestions(data.suggestions || [])
      setStep(2)
      setMaxStepReached(Math.max(maxStepReached, 2))
    } catch (err: any) {
      setError(err.message || 'Failed to fetch suggestions.')
    } finally {
      setLoading(false)
    }
  }

  async function fetchRoadmap(businessName: string) {
    if (!businessName) return
    setError('')
    setLoading(true)
    setRoadmap(null)
    try {
      const res = await fetch('/api/consultant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'roadmap', locality, budget, businessName }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setRoadmap(data.roadmap)
      setStep(3)
      setMaxStepReached(Math.max(maxStepReached, 6)) // Allow all steps once roadmap is built
    } catch (err: any) {
      setError(err.message || 'Failed to generate roadmap.')
    } finally {
      setLoading(false)
    }
  }

  function handleStepSelect(num: number) {
    if (num <= maxStepReached) {
      setStep(num)
    }
  }

  function resetPlanner() {
    if (confirm('Are you sure you want to clear current parameters?')) {
      setStep(1)
      setMaxStepReached(1)
      setLocality('')
      setBudget('Medium')
      setSuggestions([])
      setSelectedBusiness('')
      setRoadmap(null)
      setError('')
    }
  }

  return (
    <PageShell active="consultant">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fade-in-up">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-1">AI Business Consultant</h1>
          <p className="text-slate-500 text-xs mt-1.5 leading-relaxed font-medium">Design, evaluate, and launch your business with a tailored startup roadmap.</p>
        </div>
        {maxStepReached > 1 && (
          <button
            onClick={resetPlanner}
            className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold transition-all active:scale-95 self-start md:self-auto shadow-sm"
          >
            <RotateCcw size={12} className="text-teal-600" /> Reset Consultant
          </button>
        )}
      </div>

      {/* Progress navigation steps */}
      <div className="mb-8 overflow-x-auto animate-fade-in-up delay-100">
        <div className="flex items-center justify-between min-w-[650px] bg-slate-100 border border-slate-200/50 p-1 rounded-2xl">
          {stepsList.map((s) => {
            const isCompleted = s.num < step
            const isActive = s.num === step
            const isSelectable = s.num <= maxStepReached

            return (
              <button
                key={s.num}
                onClick={() => handleStepSelect(s.num)}
                disabled={!isSelectable}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[11px] font-bold transition-all ${
                  isActive
                    ? 'bg-white text-teal-700 border border-slate-200/40 shadow-sm font-bold'
                    : isSelectable
                    ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50 cursor-pointer border border-transparent'
                    : 'text-slate-400 cursor-not-allowed border border-transparent'
                }`}
              >
                <span className={`w-5 h-5 rounded-lg flex items-center justify-center ${
                  isActive 
                    ? 'bg-teal-600 text-white shadow-md shadow-teal-500/10' 
                    : isCompleted 
                    ? 'bg-teal-500/20 text-teal-700' 
                    : 'bg-white text-slate-400'
                }`}>
                  {s.num}
                </span>
                {s.name}
              </button>
            )
          })}
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-750 text-xs font-semibold rounded-xl">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-24 bg-slate-50 border border-slate-150 rounded-2xl animate-pulse-glow">
          <Loader2 size={36} className="animate-spin mx-auto mb-4 text-teal-600" />
          <p className="text-xs text-slate-500 font-medium">Processing local market signals and computing business data...</p>
        </div>
      ) : (
        <div className="animate-fade-in-up delay-200">
          {/* STEP 1: Locality Entry */}
          {step === 1 && (
            <Card className="max-w-xl mx-auto">
              <h2 className="text-sm font-bold text-slate-800 mb-5 border-b border-slate-100 pb-3">Step 1: Locate your market</h2>
              <p className="text-xs text-slate-500 mb-6 leading-relaxed font-medium">Enter the target neighborhood or locality in India to analyze demand trends.</p>

              <div className="space-y-4 mb-6">
                <FormField label="Target Locality or Neighborhood (Required)">
                  <input
                    type="text"
                    className={inputClass}
                    placeholder="e.g. Indiranagar, Bengaluru or Kothrud, Pune"
                    value={locality}
                    onChange={(e) => setLocality(e.target.value)}
                  />
                </FormField>

                <FormField label="Budget Range">
                  <select
                    className={selectClass}
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                  >
                    {budgetOptions.map(opt => (
                      <option key={opt} value={opt} className="bg-white text-slate-900">{opt}</option>
                    ))}
                  </select>
                </FormField>
              </div>

              <button
                onClick={fetchSuggestions}
                className="w-full flex items-center justify-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white py-3.5 rounded-xl font-bold text-xs transition-all shadow-lg shadow-teal-500/10 active:scale-98"
              >
                Find Business Suggestions <ArrowRight size={14} />
              </button>
            </Card>
          )}

          {/* STEP 2: Business Suggestions */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="border-b border-slate-150 pb-4">
                <h2 className="text-sm font-bold text-slate-800 mb-1">Step 2: Best business options for {locality}</h2>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed font-medium">Based on local gaps and your budget choice, these categories offer optimal potential.</p>
              </div>

              <div className="grid md:grid-cols-3 gap-5">
                {suggestions.map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      setSelectedBusiness(item.name)
                      fetchRoadmap(item.name)
                    }}
                    className={`border rounded-2xl p-5 cursor-pointer transition-all duration-300 flex flex-col justify-between group hover:-translate-y-0.5 hover:shadow-sm ${
                      selectedBusiness === item.name 
                        ? 'border-teal-500/50 bg-teal-50/50 ring-1 ring-teal-500/10 shadow-sm shadow-teal-500/5' 
                        : 'border-slate-200 bg-white hover:border-slate-350 hover:bg-slate-50/40'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <h3 className="font-bold text-xs text-slate-800 group-hover:text-teal-600 transition-colors leading-tight">{item.name}</h3>
                        <span className="text-[9px] bg-teal-50 border border-teal-200 text-teal-800 px-2 py-0.5 rounded-lg font-bold flex-shrink-0">
                          {item.demand}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-relaxed mb-5 font-medium">{item.reason}</p>
                    </div>
                    <div className="border-t border-slate-100 pt-3.5 text-[9px] text-slate-400 uppercase tracking-wider font-bold">
                      Target: <span className="text-slate-700">{item.targetAudience}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="max-w-md mx-auto bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
                <p className="text-[10px] text-slate-400 mb-3.5 text-center font-bold uppercase tracking-wider">Or enter a custom business category</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. Pet Grooming Salon"
                    className={inputClass}
                    value={selectedBusiness}
                    onChange={(e) => setSelectedBusiness(e.target.value)}
                  />
                  <button
                    onClick={() => fetchRoadmap(selectedBusiness)}
                    disabled={!selectedBusiness}
                    className="bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white text-xs font-bold px-4 rounded-xl transition-all shadow-lg shadow-teal-500/10 active:scale-95"
                  >
                    Go
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Startup Cost Estimation */}
          {step === 3 && roadmap && (
            <div className="space-y-6 max-w-3xl mx-auto">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-sm font-bold text-slate-800 mb-1">Step 3: Startup Cost Estimate ({selectedBusiness})</h2>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed font-medium">Breakdown of initial capital requirements based on local rent averages and supply costs.</p>
              </div>

              <Card className="overflow-hidden p-0 border border-slate-200">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-150 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        <th className="px-5 py-4">Category</th>
                        <th className="px-5 py-4 text-right">Estimated Cost</th>
                        <th className="px-5 py-4">Notes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {roadmap.startupCost.items.map((item, i) => (
                        <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-5 py-4 font-bold text-slate-800">{item.category}</td>
                          <td className="px-5 py-4 text-right text-teal-700 font-extrabold">{item.cost}</td>
                          <td className="px-5 py-4 text-slate-500 text-[11px] leading-relaxed font-medium">{item.notes}</td>
                        </tr>
                      ))}
                      <tr className="bg-teal-50/50 font-bold text-sm">
                        <td className="px-5 py-5 text-teal-800">Total Estimated Capital</td>
                        <td className="px-5 py-5 text-right text-teal-800 font-black">{roadmap.startupCost.total}</td>
                        <td className="px-5 py-5 text-[10px] text-teal-600 font-bold uppercase tracking-wider">Initial launch capital.</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </Card>

              <div className="flex justify-between items-center mt-6">
                <button
                  onClick={() => setStep(2)}
                  className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 font-semibold transition-colors"
                >
                  <ArrowLeft size={13} /> Back to suggestions
                </button>
                <button
                  onClick={() => setStep(4)}
                  className="flex items-center gap-1 bg-teal-600 hover:bg-teal-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition-all shadow-lg shadow-teal-500/15 active:scale-95"
                >
                  Analyze Competition <ArrowRight size={13} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Competition Analysis */}
          {step === 4 && roadmap && (
            <div className="space-y-6 max-w-3xl mx-auto">
              <div className="border-b border-slate-150 pb-4">
                <h2 className="text-sm font-bold text-slate-800 mb-1">Step 4: Competition Analysis</h2>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed font-medium">Evaluating existing competitors and defining your entry strategy.</p>
              </div>

              {roadmap.competition.isRisky && (
                <div className="border border-red-200 bg-red-50 text-red-800 p-5 rounded-2xl flex gap-3.5 items-start">
                  <AlertTriangle className="text-red-600 flex-shrink-0 mt-0.5" size={18} />
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-red-900 mb-1.5">High Market Saturation Warning</h3>
                    <p className="text-xs text-slate-700 leading-relaxed mb-4 font-medium">{roadmap.competition.riskWarning}</p>
                    
                    {roadmap.competition.proceedAdvice && (
                      <div className="border-t border-red-200/50 pt-3.5">
                        <h4 className="text-[9px] font-bold text-red-800 uppercase tracking-widest mb-2">Mitigation Plan if proceeding</h4>
                        <p className="text-[11px] text-slate-800 leading-relaxed font-medium" style={{ whiteSpace: 'pre-line' }}>{roadmap.competition.proceedAdvice}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-5">
                <Card>
                  <h3 className="text-[9px] font-bold text-teal-700 uppercase tracking-widest mb-3.5">Market Landscape</h3>
                  <div className="space-y-3.5">
                    <div>
                      <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Competitor types</span>
                      <p className="text-xs text-slate-800 font-bold">{roadmap.competition.competitorTypes}</p>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Pricing profile</span>
                      <p className="text-xs text-teal-700 font-extrabold">{roadmap.competition.pricingLevel}</p>
                    </div>
                  </div>
                </Card>

                <Card>
                  <h3 className="text-[9px] font-bold text-teal-700 uppercase tracking-widest mb-3.5">Strategic Vulnerabilities</h3>
                  <div>
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Competitor weaknesses</span>
                    <p className="text-xs text-slate-650 leading-relaxed mt-1 font-medium">{roadmap.competition.weaknesses}</p>
                  </div>
                </Card>
              </div>

              <Card className="border border-teal-200 bg-teal-50/30">
                <h3 className="text-[9px] font-bold text-teal-800 uppercase tracking-widest mb-2.5">Differentiation Strategy</h3>
                <p className="text-xs text-slate-800 leading-relaxed font-bold">{roadmap.competition.differentiation}</p>
              </Card>

              <div className="flex justify-between items-center mt-6">
                <button
                  onClick={() => setStep(3)}
                  className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 font-semibold transition-colors"
                >
                  <ArrowLeft size={13} /> Back to costs
                </button>
                <button
                  onClick={() => setStep(5)}
                  className="flex items-center gap-1 bg-teal-600 hover:bg-teal-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition-all shadow-lg shadow-teal-500/10 active:scale-95"
                >
                  Review Lean Plan <ArrowRight size={13} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: Lean Business Plan */}
          {step === 5 && roadmap && (
            <div className="space-y-6 max-w-3xl mx-auto">
              <div className="border-b border-slate-150 pb-4">
                <h2 className="text-sm font-bold text-slate-800 mb-1">Step 5: Lean Business Plan</h2>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed font-medium">A high-level overview of target segments, values, resources, and flows.</p>
              </div>

              <div className="grid md:grid-cols-3 gap-5">
                <Card className="md:col-span-3">
                  <h3 className="text-[9px] font-bold text-teal-700 uppercase tracking-widest mb-2">Value Proposition</h3>
                  <p className="text-xs text-slate-800 leading-relaxed font-bold">{roadmap.businessPlan.valueProp}</p>
                </Card>

                <div className="md:col-span-3 grid md:grid-cols-2 gap-5">
                  <Card>
                    <h3 className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-2">Customer Segments</h3>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium">{roadmap.businessPlan.customerSegments}</p>
                  </Card>

                  <Card>
                    <h3 className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-2">Key Activities</h3>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium">{roadmap.businessPlan.activities}</p>
                  </Card>

                  <Card>
                    <h3 className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-2">Revenue Streams</h3>
                    <p className="text-xs text-teal-700 leading-relaxed font-bold">{roadmap.businessPlan.revenueStreams}</p>
                  </Card>

                  <Card>
                    <h3 className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-2">Key Cost Drivers</h3>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium">{roadmap.businessPlan.costDrivers}</p>
                  </Card>
                </div>
              </div>

              <div className="flex justify-between items-center mt-6">
                <button
                  onClick={() => setStep(4)}
                  className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 font-semibold transition-colors"
                >
                  <ArrowLeft size={13} /> Back to competition
                </button>
                <button
                  onClick={() => setStep(6)}
                  className="flex items-center gap-1 bg-teal-600 hover:bg-teal-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition-all shadow-lg shadow-teal-500/10 active:scale-95"
                >
                  Go to Marketing <ArrowRight size={13} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 6: Digital Marketing Strategy */}
          {step === 6 && roadmap && (
            <div className="space-y-6 max-w-3xl mx-auto">
              <div className="border-b border-slate-150 pb-4">
                <h2 className="text-sm font-bold text-slate-800 mb-1">Step 6: Digital Marketing Strategy</h2>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed font-medium">Launching the startup with maximum local reach and digital engagement.</p>
              </div>

              <div className="grid md:grid-cols-2 gap-5">
                <div className="space-y-5">
                  <h3 className="text-[9px] font-bold text-teal-700 uppercase tracking-widest mb-1.5">Recommended Channels</h3>
                  <div className="space-y-3">
                    {roadmap.marketing.channels.map((ch, idx) => (
                      <div key={idx} className="bg-slate-50 border border-slate-150 p-4 rounded-xl">
                        <span className="text-xs font-bold text-slate-800">{ch.name}</span>
                        <p className="text-[11px] text-slate-500 leading-relaxed mt-1 font-medium">{ch.detail}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-5">
                  <h3 className="text-[9px] font-bold text-teal-700 uppercase tracking-widest mb-1.5">Launch Timeline</h3>
                  <div className="space-y-3.5 border-l-2 border-slate-200 pl-4 ml-2.5">
                    {roadmap.marketing.timeline.map((item, idx) => (
                      <div key={idx} className="relative">
                        <div className="absolute -left-[23px] top-1.5 w-3 h-3 rounded-full bg-teal-500 border border-[#f8fafc]" />
                        <span className="text-[10px] text-teal-600 font-bold uppercase tracking-wider block mb-0.5">{item.phase}</span>
                        <p className="text-xs text-slate-600 leading-relaxed font-medium">{item.task}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Save Plan Row */}
              <div className="border-t border-slate-150 pt-6 mt-6 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-teal-600" />
                  <p className="text-xs text-slate-600 font-semibold">Your startup planning roadmap is fully generated!</p>
                </div>
                {user ? (
                  <button
                    onClick={saveRoadmap}
                    disabled={saveStatus === 'saving' || saveStatus === 'saved'}
                    className="flex items-center gap-1.5 px-4.5 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition-all shadow-lg shadow-teal-500/10 active:scale-95"
                  >
                    {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? 'Saved to Dashboard' : 'Save Roadmap to Dashboard'}
                  </button>
                ) : (
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Sign in to save this startup plan to your dashboard.</p>
                )}
              </div>

              <div className="flex justify-between items-center mt-6">
                <button
                  onClick={() => setStep(5)}
                  className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 font-semibold transition-colors"
                >
                  <ArrowLeft size={13} /> Back to plan
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </PageShell>
  )
}
