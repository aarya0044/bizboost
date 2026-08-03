'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { PageShell, Card, ScoreRing } from '@/components/ui/shared'
import { Loader2, Trash2, Calendar, MapPin, ChevronRight, X, Briefcase, Sparkles, AlertCircle } from 'lucide-react'

interface SavedScan {
  id: string
  biz_type: string
  location: string
  viability_score: number
  verdict: string
  created_at: string
  details: any
}

interface SavedRoadmap {
  id: string
  biz_type: string
  locality: string
  budget: string
  created_at: string
  roadmap: any
}

export default function DashboardPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [scans, setScans] = useState<SavedScan[]>([])
  const [roadmaps, setRoadmaps] = useState<SavedRoadmap[]>([])
  const [activeTab, setActiveTab] = useState<'scans' | 'roadmaps'>('scans')
  const [selectedScan, setSelectedScan] = useState<SavedScan | null>(null)
  const [selectedRoadmap, setSelectedRoadmap] = useState<SavedRoadmap | null>(null)

  useEffect(() => {
    async function checkAuthAndFetch() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.replace('/login')
        return
      }
      setUser(session.user)

      try {
        const { data: scansData, error: scansError } = await supabase
          .from('saved_scans')
          .select('*')
          .order('created_at', { ascending: false })
        if (scansError) throw scansError
        setScans(scansData || [])

        const { data: roadmapsData, error: roadmapsError } = await supabase
          .from('saved_roadmaps')
          .select('*')
          .order('created_at', { ascending: false })
        if (roadmapsError) throw roadmapsError
        setRoadmaps(roadmapsData || [])
      } catch (err) {
        console.error('Error fetching dashboard data:', err)
      } finally {
        setLoading(false)
      }
    }
    checkAuthAndFetch()
  }, [router])

  async function deleteScan(id: string, e: React.MouseEvent) {
    e.stopPropagation()
    if (!confirm('Are you sure you want to delete this saved scan?')) return
    try {
      const { error } = await supabase.from('saved_scans').delete().eq('id', id)
      if (error) throw error
      setScans(prev => prev.filter(s => s.id !== id))
      if (selectedScan?.id === id) setSelectedScan(null)
    } catch (err) {
      alert('Failed to delete: ' + (err as any).message)
    }
  }

  async function deleteRoadmap(id: string, e: React.MouseEvent) {
    e.stopPropagation()
    if (!confirm('Are you sure you want to delete this saved roadmap?')) return
    try {
      const { error } = await supabase.from('saved_roadmaps').delete().eq('id', id)
      if (error) throw error
      setRoadmaps(prev => prev.filter(r => r.id !== id))
      if (selectedRoadmap?.id === id) setSelectedRoadmap(null)
    } catch (err) {
      alert('Failed to delete: ' + (err as any).message)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans">
        <div className="text-center">
          <Loader2 size={32} className="animate-spin text-teal-600 mx-auto mb-3" />
          <p className="text-xs text-slate-500">Loading your dashboard profile...</p>
        </div>
      </div>
    )
  }

  return (
    <PageShell active="consultant">
      <div className="mb-8 font-sans animate-fade-in-up">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-1">Your Dashboard</h1>
        <p className="text-slate-500 text-xs mt-1.5 flex items-center gap-1.5 font-medium">
          <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></span>
          Account: <span className="text-slate-800 font-bold">{user?.email}</span>
        </p>
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-100 border border-slate-200/50 rounded-2xl p-1 mb-8 font-sans max-w-md animate-fade-in-up delay-100">
        <button
          onClick={() => setActiveTab('scans')}
          className={`flex-1 text-center py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
            activeTab === 'scans' 
              ? 'bg-white text-teal-700 border border-slate-200/40 shadow-sm' 
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/30'
          }`}
        >
          Saved Location Scans ({scans.length})
        </button>
        <button
          onClick={() => setActiveTab('roadmaps')}
          className={`flex-1 text-center py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
            activeTab === 'roadmaps' 
              ? 'bg-white text-teal-700 border border-slate-200/40 shadow-sm' 
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/30'
          }`}
        >
          Consultant Roadmaps ({roadmaps.length})
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-8 font-sans items-start animate-fade-in-up delay-200">
        {/* List Pane */}
        <div className="md:col-span-1 space-y-3.5 max-h-[550px] overflow-y-auto pr-1">
          {activeTab === 'scans' ? (
            scans.length === 0 ? (
              <div className="text-center py-12 px-4 bg-slate-50 border border-slate-100 rounded-2xl">
                <p className="text-xs text-slate-500 font-medium">No saved scans found.</p>
              </div>
            ) : (
              scans.map(s => (
                <div
                  key={s.id}
                  onClick={() => { setSelectedScan(s); setSelectedRoadmap(null) }}
                  className={`border rounded-2xl p-4.5 cursor-pointer transition-all duration-300 flex items-center justify-between group hover:-translate-y-0.5 hover:shadow-sm ${
                    selectedScan?.id === s.id 
                      ? 'border-teal-500/50 bg-teal-50/50 ring-1 ring-teal-500/10 shadow-sm shadow-teal-500/5' 
                      : 'border-slate-200/60 bg-white hover:border-slate-350 hover:bg-slate-50/30'
                  }`}
                >
                  <div className="flex-1 min-w-0 pr-3">
                    <span className="text-[10px] text-teal-600 font-bold uppercase tracking-wider block mb-1">{s.verdict}</span>
                    <h3 className="font-bold text-sm text-slate-800 truncate mb-2">{s.biz_type}</h3>
                    <div className="flex items-center gap-3 text-[10px] text-slate-450 font-medium">
                      <span className="flex items-center gap-1 truncate"><MapPin size={11} className="text-slate-400" /> {s.location}</span>
                      <span className="flex items-center gap-1 flex-shrink-0"><Calendar size={11} className="text-slate-400" /> {formatDate(s.created_at)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={(e) => deleteScan(s.id, e)}
                      className="w-7 h-7 rounded-lg border border-slate-200 text-slate-400 hover:text-red-600 hover:bg-red-50 flex items-center justify-center transition-all duration-200 active:scale-90"
                    >
                      <Trash2 size={12} />
                    </button>
                    <ChevronRight size={14} className="text-slate-400 group-hover:text-slate-600 transition-colors" />
                  </div>
                </div>
              ))
            )
          ) : (
            roadmaps.length === 0 ? (
              <div className="text-center py-12 px-4 bg-slate-50 border border-slate-100 rounded-2xl">
                <p className="text-xs text-slate-500 font-medium">No saved roadmaps found.</p>
              </div>
            ) : (
              roadmaps.map(r => (
                <div
                  key={r.id}
                  onClick={() => { setSelectedRoadmap(r); setSelectedScan(null) }}
                  className={`border rounded-2xl p-4.5 cursor-pointer transition-all duration-300 flex items-center justify-between group hover:-translate-y-0.5 hover:shadow-sm ${
                    selectedRoadmap?.id === r.id 
                      ? 'border-teal-500/50 bg-teal-50/50 ring-1 ring-teal-500/10 shadow-sm shadow-teal-500/5' 
                      : 'border-slate-200/60 bg-white hover:border-slate-350 hover:bg-slate-50/30'
                  }`}
                >
                  <div className="flex-1 min-w-0 pr-3">
                    <span className="text-[10px] text-teal-600 font-bold uppercase tracking-wider block mb-1">{r.budget}</span>
                    <h3 className="font-bold text-sm text-slate-800 truncate mb-2">{r.biz_type}</h3>
                    <div className="flex items-center gap-3 text-[10px] text-slate-450 font-medium">
                      <span className="flex items-center gap-1 truncate"><MapPin size={11} className="text-slate-400" /> {r.locality}</span>
                      <span className="flex items-center gap-1 flex-shrink-0"><Calendar size={11} className="text-slate-400" /> {formatDate(r.created_at)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={(e) => deleteRoadmap(r.id, e)}
                      className="w-7 h-7 rounded-lg border border-slate-200 text-slate-400 hover:text-red-600 hover:bg-red-50 flex items-center justify-center transition-all duration-200 active:scale-90"
                    >
                      <Trash2 size={12} />
                    </button>
                    <ChevronRight size={14} className="text-slate-400 group-hover:text-slate-600 transition-colors" />
                  </div>
                </div>
              ))
            )
          )}
        </div>

        {/* Detail View Pane */}
        <div className="md:col-span-2">
          {selectedScan ? (
            <Card className="relative p-6.5 animate-scale-in">
              <button
                onClick={() => setSelectedScan(null)}
                className="absolute top-4.5 right-4.5 text-slate-400 hover:text-slate-800 p-1 rounded-lg hover:bg-slate-100 transition-all"
              >
                <X size={15} />
              </button>
              <div className="flex items-center gap-4.5 mb-6 pb-6 border-b border-slate-100">
                <ScoreRing score={selectedScan.viability_score} />
                <div>
                  <h2 className="text-lg font-bold text-slate-900 mb-1">{selectedScan.biz_type}</h2>
                  <p className="text-xs text-slate-500 flex items-center gap-1.5 font-medium">
                    <MapPin size={13} className="text-teal-600" /> {selectedScan.location} · Saved on {formatDate(selectedScan.created_at)}
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-[10px] font-bold text-teal-600 uppercase tracking-widest mb-1.5">AI Analysis Verdict</h3>
                  <p className="text-sm text-slate-850 leading-relaxed font-bold mb-2">{selectedScan.verdict}</p>
                  <p className="text-xs text-slate-500 leading-relaxed">{selectedScan.details.verdictReason}</p>
                </div>

                <div>
                  <h3 className="text-[10px] font-bold text-teal-600 uppercase tracking-widest mb-3">Key Performance Metrics</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl hover:border-slate-200 transition-all">
                      <span className="text-[9px] text-slate-400 uppercase tracking-wider font-bold block mb-0.5">Footfall</span>
                      <p className="text-base font-black text-teal-600">{selectedScan.details.footfallScore}<span className="text-[10px] text-slate-400 font-normal">/100</span></p>
                    </div>
                    <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl hover:border-slate-200 transition-all">
                      <span className="text-[9px] text-slate-400 uppercase tracking-wider font-bold block mb-0.5">Demographic Match</span>
                      <p className="text-base font-black text-teal-600">{selectedScan.details.demographicMatch}<span className="text-[10px] text-slate-400 font-normal">/100</span></p>
                    </div>
                    <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl hover:border-slate-200 transition-all">
                      <span className="text-[9px] text-slate-400 uppercase tracking-wider font-bold block mb-0.5">Market Gap</span>
                      <p className="text-base font-black text-teal-600">{selectedScan.details.marketGap}<span className="text-[10px] text-slate-400 font-normal">/100</span></p>
                    </div>
                  </div>
                </div>

                {selectedScan.details.topActions && (
                  <div>
                    <h3 className="text-[10px] font-bold text-teal-600 uppercase tracking-widest mb-3">Action Plan</h3>
                    <ul className="space-y-2.5">
                      {selectedScan.details.topActions.map((act: string, idx: number) => (
                        <li key={idx} className="flex gap-2.5 items-start text-xs text-slate-650">
                          <span className="w-5 h-5 rounded-full bg-teal-50 border border-teal-100 text-teal-700 flex items-center justify-center font-bold text-[10px] flex-shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <span className="leading-relaxed">{act}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </Card>
          ) : selectedRoadmap ? (
            <Card className="relative p-6.5 animate-scale-in">
              <button
                onClick={() => setSelectedRoadmap(null)}
                className="absolute top-4.5 right-4.5 text-slate-400 hover:text-slate-800 p-1 rounded-lg hover:bg-slate-100 transition-all"
              >
                <X size={15} />
              </button>
              <div className="flex items-center gap-3.5 mb-6 pb-6 border-b border-slate-100">
                <div className="w-11 h-11 rounded-xl bg-teal-50 border border-teal-100 text-teal-600 flex items-center justify-center shadow-md shadow-teal-500/5">
                  <Briefcase size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 mb-1">{selectedRoadmap.biz_type}</h2>
                  <p className="text-xs text-slate-500 flex items-center gap-1.5 font-medium">
                    <MapPin size={13} className="text-teal-600" /> {selectedRoadmap.locality} · Budget: {selectedRoadmap.budget}
                  </p>
                </div>
              </div>

              <div className="space-y-6 max-h-[420px] overflow-y-auto pr-2">
                <div>
                  <h3 className="text-[10px] font-bold text-teal-600 uppercase tracking-widest mb-2">Startup Capital Required</h3>
                  <div className="bg-teal-50/50 border border-teal-100 rounded-xl p-4 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Estimated Setup Cost</div>
                      <div className="text-2xl font-black text-slate-850 mt-1">{selectedRoadmap.roadmap.startupCost?.total}</div>
                    </div>
                    <div className="text-xs text-teal-700 bg-teal-50 border border-teal-100/50 px-3 py-1 rounded-lg font-bold">Ready to Launch</div>
                  </div>
                </div>

                {selectedRoadmap.roadmap.competition?.isRisky && (
                  <div className="bg-red-50 border border-red-100 p-4 rounded-xl flex gap-3 items-start">
                    <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={16} />
                    <div>
                      <span className="text-[10px] font-bold text-red-700 uppercase tracking-wider block mb-1">Market Risk Advisory</span>
                      <p className="text-xs text-slate-700 leading-relaxed">{selectedRoadmap.roadmap.competition.riskWarning}</p>
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="text-[10px] font-bold text-teal-600 uppercase tracking-widest mb-3">Startup Plan Details</h3>
                  <div className="space-y-3">
                    <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
                      <span className="text-[10px] text-teal-600 font-bold uppercase tracking-wider block mb-1.5">Value Proposition</span>
                      <p className="text-xs text-slate-650 leading-relaxed">{selectedRoadmap.roadmap.businessPlan?.valueProp}</p>
                    </div>
                    <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1.5">Target Segments</span>
                      <p className="text-xs text-slate-650 leading-relaxed">{selectedRoadmap.roadmap.businessPlan?.customerSegments}</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ) : (
            <div className="h-full min-h-[350px] bg-slate-50 border border-slate-100 rounded-2xl flex flex-col items-center justify-center p-6 text-center text-slate-450 animate-pulse-glow">
              <Sparkles size={28} className="text-teal-600/40 mb-3 animate-float" />
              <h2 className="text-sm font-semibold text-slate-700">Detailed Report Viewer</h2>
              <p className="text-xs max-w-xs text-slate-500 mt-1.5 leading-relaxed font-medium">Select a saved Location Scan or Business Roadmap from the list to view its complete audit analysis.</p>
            </div>
          )}
        </div>
      </div>
    </PageShell>
  )
}
