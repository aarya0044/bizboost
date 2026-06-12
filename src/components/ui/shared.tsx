'use client'
import { ReactNode } from 'react'
import Link from 'next/link'
import { TrendingUp } from 'lucide-react'

export function PageShell({ children, active }: { children: ReactNode; active: 'location' | 'digital' }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="border-b border-gray-100 bg-white sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-brand-500 flex items-center justify-center">
              <TrendingUp size={14} className="text-white" />
            </div>
            <span className="font-semibold">Biz<span className="text-brand-500">Boost</span></span>
          </Link>
          <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
            <Link href="/location" className={`text-sm px-4 py-1.5 rounded-md transition-colors ${active === 'location' ? 'bg-white text-gray-900 shadow-sm font-medium' : 'text-gray-500 hover:text-gray-700'}`}>
              📍 Location
            </Link>
            <Link href="/digital" className={`text-sm px-4 py-1.5 rounded-md transition-colors ${active === 'digital' ? 'bg-white text-gray-900 shadow-sm font-medium' : 'text-gray-500 hover:text-gray-700'}`}>
              🌐 Digital & SEO
            </Link>
          </div>
        </div>
      </nav>
      <main className="max-w-4xl mx-auto px-6 py-8">
        {children}
      </main>
    </div>
  )
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-2xl border border-gray-100 p-6 ${className}`}>
      {children}
    </div>
  )
}

export function ScoreRing({ score }: { score: number }) {
  const color = score >= 70 ? '#1D9E75' : score >= 45 ? '#BA7517' : '#E24B4A'
  const r = 34, cx = 40, cy = 40
  const circ = 2 * Math.PI * r
  const dash = (score / 100) * circ
  return (
    <div className="relative w-20 h-20 flex-shrink-0">
      <svg width="80" height="80" viewBox="0 0 80 80">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#e5e7eb" strokeWidth="6" />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth="6"
          strokeDasharray={`${dash.toFixed(1)} ${circ.toFixed(1)}`}
          strokeDashoffset={(circ / 4).toFixed(1)}
          strokeLinecap="round"
          transform={`rotate(-90 ${cx} ${cy})`} />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-xl font-semibold text-gray-800">
        {score}
      </div>
    </div>
  )
}

export function MetricCard({ label, value, description }: { label: string; value: number; description?: string }) {
  const color = value >= 70 ? 'text-brand-500' : value >= 45 ? 'text-amber-600' : 'text-red-500'
  return (
    <div className="bg-gray-50 rounded-xl p-4">
      <div className="text-xs text-gray-400 mb-1">{label}</div>
      <div className={`text-2xl font-semibold ${color}`}>{value}<span className="text-sm text-gray-400">/100</span></div>
      {description && <div className="text-xs text-gray-400 mt-1">{description}</div>}
    </div>
  )
}

export function InsightBlock({ type, title, text }: { type: 'good' | 'warn' | 'bad'; title: string; text: string }) {
  const colors = { good: 'border-brand-500', warn: 'border-amber-400', bad: 'border-red-400' }
  const icons = { good: '✓', warn: '⚠', bad: '✗' }
  const iconColors = { good: 'text-brand-600', warn: 'text-amber-600', bad: 'text-red-500' }
  return (
    <div className={`border-l-2 ${colors[type]} pl-4 mb-3`}>
      <div className="text-sm font-medium text-gray-800 mb-0.5">
        <span className={`${iconColors[type]} mr-1`}>{icons[type]}</span> {title}
      </div>
      <div className="text-sm text-gray-500 leading-relaxed">{text}</div>
    </div>
  )
}

export function VerdictBadge({ score, verdict }: { score: number; verdict: string }) {
  if (score >= 70) return <span className="inline-flex items-center gap-1.5 bg-brand-50 text-brand-700 border border-brand-200 rounded-full px-3 py-1 text-sm font-medium">✓ {verdict}</span>
  if (score >= 45) return <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-full px-3 py-1 text-sm font-medium">⚠ {verdict}</span>
  return <span className="inline-flex items-center gap-1.5 bg-red-50 text-red-700 border border-red-200 rounded-full px-3 py-1 text-sm font-medium">✗ {verdict}</span>
}

export function Spinner() {
  return <div className="w-5 h-5 border-2 border-brand-200 border-t-brand-500 rounded-full animate-spin-slow" />
}

export function FormField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-1.5">{label}</label>
      {children}
    </div>
  )
}

export const inputClass = "w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl bg-white text-gray-900 placeholder-gray-400 transition-colors"
export const selectClass = "w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl bg-white text-gray-900 transition-colors"
export const textareaClass = "w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl bg-white text-gray-900 placeholder-gray-400 transition-colors resize-none"
