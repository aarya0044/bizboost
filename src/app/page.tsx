'use client'
import Link from 'next/link'
import { Building2, Globe, MapPin, TrendingUp, Search, Zap } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-emerald-50">
      {/* Nav */}
      <nav className="border-b border-gray-100 bg-white/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center">
              <TrendingUp size={16} className="text-white" />
            </div>
            <span className="font-semibold text-lg">Biz<span className="text-brand-500">Boost</span></span>
          </div>
          <div className="flex gap-3">
            <Link href="/location" className="text-sm px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:border-brand-500 hover:text-brand-600 transition-colors">
              Location Analyzer
            </Link>
            <Link href="/digital" className="text-sm px-4 py-2 rounded-lg bg-brand-500 text-white hover:bg-brand-600 transition-colors">
              SEO & Digital
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div className="max-w-5xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 text-xs bg-brand-50 text-brand-600 border border-brand-100 rounded-full px-3 py-1 mb-6">
          <Zap size={12} /> Powered by Claude AI · 100% Free to use
        </div>
        <h1 className="text-5xl font-bold text-gray-900 mb-5 leading-tight">
          Is your business in the<br />
          <span className="text-brand-500">right place?</span>
        </h1>
        <p className="text-lg text-gray-500 max-w-xl mx-auto mb-10">
          Get AI-powered insights on whether your physical store location will succeed,
          and how to grow your business online — all free, no signup needed.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link href="/location" className="flex items-center gap-2 bg-brand-500 text-white px-6 py-3 rounded-xl font-medium hover:bg-brand-600 transition-colors shadow-lg shadow-brand-500/20">
            <MapPin size={18} /> Analyze a location
          </Link>
          <Link href="/digital" className="flex items-center gap-2 bg-white text-gray-700 border border-gray-200 px-6 py-3 rounded-xl font-medium hover:border-brand-400 transition-colors">
            <Globe size={18} /> Get SEO advice
          </Link>
        </div>
      </div>

      {/* Feature cards */}
      <div className="max-w-5xl mx-auto px-6 pb-20">
        <div className="grid md:grid-cols-2 gap-6">
          <Link href="/location" className="group bg-white rounded-2xl border border-gray-100 p-6 hover:border-brand-300 hover:shadow-md transition-all">
            <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center mb-4 group-hover:bg-brand-100 transition-colors">
              <Building2 size={20} className="text-brand-600" />
            </div>
            <h2 className="text-lg font-semibold mb-2">Location Intelligence</h2>
            <p className="text-gray-500 text-sm leading-relaxed mb-4">
              Tell us your business type and target area. We'll score the location, find competitors,
              assess demographics, and suggest better spots within a few km.
            </p>
            <div className="flex flex-wrap gap-2">
              {['Viability score','Competitor map','Alternative locations','Market gap analysis'].map(t => (
                <span key={t} className="text-xs bg-gray-50 border border-gray-100 text-gray-500 rounded-full px-3 py-1">{t}</span>
              ))}
            </div>
          </Link>

          <Link href="/digital" className="group bg-white rounded-2xl border border-gray-100 p-6 hover:border-brand-300 hover:shadow-md transition-all">
            <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center mb-4 group-hover:bg-brand-100 transition-colors">
              <Search size={20} className="text-brand-600" />
            </div>
            <h2 className="text-lg font-semibold mb-2">Digital & SEO Advisor</h2>
            <p className="text-gray-500 text-sm leading-relaxed mb-4">
              Enter your website URL and we'll run a live PageSpeed audit, analyze your tech stack,
              give you keyword strategies, and tell you exactly how to reach your target audience.
            </p>
            <div className="flex flex-wrap gap-2">
              {['Live PageSpeed audit','Keyword strategy','Tech stack advice','Audience targeting'].map(t => (
                <span key={t} className="text-xs bg-gray-50 border border-gray-100 text-gray-500 rounded-full px-3 py-1">{t}</span>
              ))}
            </div>
          </Link>
        </div>

        {/* How it works */}
        <div className="mt-12 bg-white rounded-2xl border border-gray-100 p-8">
          <h2 className="text-xl font-semibold mb-6 text-center">How it works</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { step: '1', icon: <Building2 size={18} />, title: 'Describe your business', desc: 'Tell us your business type, location, services, and target customers.' },
              { step: '2', icon: <Search size={18} />, title: 'We fetch real data', desc: 'Google Places competitors, live PageSpeed scores, and local market signals.' },
              { step: '3', icon: <TrendingUp size={18} />, title: 'Get AI-powered insights', desc: 'Claude AI synthesizes everything into a clear verdict with actionable steps.' },
            ].map(item => (
              <div key={item.step} className="flex flex-col items-center text-center">
                <div className="w-10 h-10 rounded-full bg-brand-50 border-2 border-brand-200 flex items-center justify-center text-brand-600 mb-3">
                  {item.icon}
                </div>
                <h3 className="font-medium mb-1 text-sm">{item.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-8">
          No signup required · No data stored · Built for Indian SMBs · Free forever
        </p>
      </div>
    </div>
  )
}
