'use client'
import { ReactNode, useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { TrendingUp, LogOut, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'

import ChatWidget from '../ChatWidget'

export function PageShell({ children, active }: { children: ReactNode; active: 'location' | 'digital' | 'chat' | 'consultant' }) {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.replace('/login')
      } else {
        setUser(session.user)
        setLoading(false)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        router.replace('/login')
      } else {
        setUser(session?.user ?? null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center font-sans">
        <Loader2 size={32} className="animate-spin text-teal-600 mb-3" />
        <h2 className="text-sm font-semibold text-slate-800">Verifying session...</h2>
        <p className="text-xs text-slate-500 mt-1">Please sign in to access this page.</p>
      </div>
    )
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.replace('/')
  }

  return (
    <div className="min-h-screen bg-transparent relative">
      <nav className="glass-nav sticky top-0 z-50 font-sans transition-all duration-300">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center shadow-lg shadow-teal-500/10 group-hover:scale-105 transition-all">
              <TrendingUp size={15} className="text-white" />
            </div>
            <span className="font-bold tracking-tight text-slate-900 text-base">
              Biz<span className="text-teal-600 font-extrabold">Boost</span>
            </span>
          </Link>
          <div className="flex gap-1 bg-slate-100 border border-slate-200/50 rounded-xl p-1">
            <Link href="/location" className={`text-xs px-3.5 py-1.5 rounded-lg transition-all duration-200 ${active === 'location' ? 'bg-white text-teal-700 border border-slate-200/40 shadow-sm font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'}`}>
              Location
            </Link>
            <Link href="/digital" className={`text-xs px-3.5 py-1.5 rounded-lg transition-all duration-200 ${active === 'digital' ? 'bg-white text-teal-700 border border-slate-200/40 shadow-sm font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'}`}>
              Digital & SEO
            </Link>
            <Link href="/chat" className={`text-xs px-3.5 py-1.5 rounded-lg transition-all duration-200 ${active === 'chat' ? 'bg-white text-teal-700 border border-slate-200/40 shadow-sm font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'}`}>
              AI Chat
            </Link>
            <Link href="/consultant" className={`text-xs px-3.5 py-1.5 rounded-lg transition-all duration-200 ${active === 'consultant' ? 'bg-white text-teal-700 border border-slate-200/40 shadow-sm font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'}`}>
              Biz Consultant
            </Link>
          </div>
          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-2">
                <Link href="/dashboard" className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/60 font-semibold px-3 py-1.5 rounded-xl transition-all active:scale-95">
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-slate-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-xl transition-all"
                  title="Sign Out"
                >
                  <LogOut size={14} />
                </button>
              </div>
            ) : (
              <Link href="/login" className="text-xs bg-teal-600 hover:bg-teal-700 text-white font-semibold px-3.5 py-1.5 rounded-xl transition-all shadow-lg shadow-teal-500/10 active:scale-95">
                Sign In
              </Link>
            )}
          </div>
        </div>
      </nav>
      <main className="max-w-4xl mx-auto px-6 py-8 animate-fade-in-up">
        {children}
      </main>
      <ChatWidget />
    </div>
  )
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`glass-card rounded-2xl p-6 ${className}`}>
      {children}
    </div>
  )
}

export function ScoreRing({ score }: { score: number }) {
  const color = score >= 70 ? '#0d9488' : score >= 45 ? '#d97706' : '#dc2626'
  const r = 34, cx = 40, cy = 40
  const circ = 2 * Math.PI * r
  const dash = (score / 100) * circ
  return (
    <div className="relative w-20 h-20 flex-shrink-0 animate-scale-in">
      <svg width="80" height="80" viewBox="0 0 80 80">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(15, 23, 42, 0.05)" strokeWidth="6" />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth="6"
          strokeDasharray={`${dash.toFixed(1)} ${circ.toFixed(1)}`}
          strokeDashoffset={(circ / 4).toFixed(1)}
          strokeLinecap="round"
          transform={`rotate(-90 ${cx} ${cy})`} />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-xl font-extrabold text-slate-800">
        {score}
      </div>
    </div>
  )
}

export function MetricCard({ label, value, description }: { label: string; value: number; description?: string }) {
  const color = value >= 70 ? 'text-teal-600' : value >= 45 ? 'text-amber-600' : 'text-red-600'
  return (
    <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 transition-all duration-200 hover:border-slate-200">
      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">{label}</div>
      <div className={`text-2xl font-extrabold ${color}`}>{value}<span className="text-xs text-slate-500 font-normal">/100</span></div>
      {description && <div className="text-xs text-slate-500 mt-1 leading-relaxed">{description}</div>}
    </div>
  )
}

export function InsightBlock({ type, title, text }: { type: 'good' | 'warn' | 'bad'; title: string; text: string }) {
  const colors = { 
    good: 'border-teal-500 bg-teal-50/50', 
    warn: 'border-amber-500 bg-amber-50/50', 
    bad: 'border-red-500 bg-red-50/50' 
  }
  const icons = { good: '✓', warn: '⚠', bad: '✗' }
  const iconColors = { good: 'text-teal-600', warn: 'text-amber-600', bad: 'text-red-600' }
  return (
    <div className={`border-l-2 ${colors[type]} p-3.5 rounded-r-xl mb-3 transition-all duration-200 hover:bg-opacity-80`}>
      <div className="text-sm font-bold text-slate-800 mb-1 flex items-center gap-1.5">
        <span className={`${iconColors[type]} font-bold`}>{icons[type]}</span> {title}
      </div>
      <div className="text-xs text-slate-500 leading-relaxed">{text}</div>
    </div>
  )
}

export function VerdictBadge({ score, verdict }: { score: number; verdict: string }) {
  if (score >= 70) return <span className="inline-flex items-center gap-1 bg-teal-50 text-teal-800 border border-teal-200 rounded-full px-3 py-1 text-xs font-semibold">✓ {verdict}</span>
  if (score >= 45) return <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-full px-3 py-1 text-xs font-semibold">⚠ {verdict}</span>
  return <span className="inline-flex items-center gap-1 bg-red-50 text-red-800 border border-red-200 rounded-full px-3 py-1 text-xs font-semibold">✗ {verdict}</span>
}

export function Spinner() {
  return <div className="w-5 h-5 border-2 border-teal-200 border-t-teal-600 rounded-full animate-spin" />
}

export function FormField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">{label}</label>
      {children}
    </div>
  )
}

export const inputClass = "w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl bg-white text-slate-900 placeholder-slate-400 transition-all focus:border-teal-500 focus:ring-4 focus:ring-teal-500/5"
export const selectClass = "w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl bg-white text-slate-900 transition-all focus:border-teal-500 focus:ring-4 focus:ring-teal-500/5"
export const textareaClass = "w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl bg-white text-slate-900 placeholder-slate-400 transition-all focus:border-teal-500 focus:ring-4 focus:ring-teal-500/5 resize-none"


