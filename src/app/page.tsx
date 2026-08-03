'use client'
import Link from 'next/link'
import { Building2, Globe, MapPin, TrendingUp, Search, Zap, ArrowRight, ShieldCheck, Database } from 'lucide-react'
import ChatWidget from '@/components/ChatWidget'

export default function Home() {
  return (
    <div className="min-h-screen bg-transparent font-sans text-slate-800 relative overflow-hidden">
      {/* Background blobs for visual interest */}
      <div className="absolute top-20 left-1/4 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl animate-float -z-10"></div>
      <div className="absolute top-80 right-1/4 w-80 h-80 bg-teal-600/3 rounded-full blur-3xl animate-float -z-10" style={{ animationDelay: '2s' }}></div>
      <div className="absolute -top-40 right-10 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl animate-float -z-10" style={{ animationDelay: '4s' }}></div>

      {/* Nav */}
      <nav className="glass-nav sticky top-0 z-50 transition-all duration-300">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group cursor-pointer">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center shadow-lg shadow-teal-500/10 group-hover:scale-105 group-hover:shadow-teal-500/20 transition-all duration-300">
              <TrendingUp size={16} className="text-white" />
            </div>
            <span className="font-bold tracking-tight text-slate-900 text-base">
              Biz<span className="text-teal-600 font-extrabold group-hover:text-teal-500 transition-colors">Boost</span>
            </span>
          </Link>
          <div className="flex gap-3">
            <Link href="/location" className="text-xs px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:text-teal-600 hover:border-teal-200 hover:bg-teal-50/10 shadow-sm transition-all duration-200 font-semibold active:scale-95">
              Location Analyzer
            </Link>
            <Link href="/digital" className="text-xs px-4 py-2.5 rounded-xl bg-teal-600 text-white hover:bg-teal-700 shadow-md shadow-teal-600/10 hover:shadow-lg hover:shadow-teal-600/20 hover:-translate-y-0.5 transition-all duration-200 font-semibold active:scale-95">
              SEO & Digital
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div className="max-w-4xl mx-auto px-6 pt-28 pb-24 text-center relative z-10 animate-fade-in-up">
        <div className="inline-flex items-center gap-2 text-[10px] uppercase tracking-widest bg-teal-50 border border-teal-100/80 text-teal-800 rounded-full px-4 py-1.5 mb-8 font-bold shadow-sm">
          <Zap size={11} className="text-teal-600 animate-pulse" /> Powered by Advanced AI
        </div>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-900 tracking-tight leading-[1.15] mb-6">
          Is your business in the<br />
          <span className="bg-gradient-to-r from-teal-600 via-teal-500 to-emerald-600 bg-clip-text text-transparent">right place?</span>
        </h1>
        <p className="text-sm md:text-base text-slate-500 max-w-xl mx-auto mb-10 leading-relaxed">
          Get real-time insights on whether your physical store location will succeed,
          and how to grow your business online. Fast, secure, and built for modern enterprise audits.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link href="/location" className="w-full sm:w-auto flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-md shadow-teal-600/10 hover:shadow-lg hover:shadow-teal-600/20 hover:-translate-y-0.5 active:scale-98">
            <MapPin size={16} /> Analyze a location
          </Link>
          <Link href="/digital" className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-700 px-6 py-3 rounded-xl font-bold transition-all hover:bg-slate-50 hover:border-slate-300 hover:-translate-y-0.5 active:scale-98 shadow-sm hover:shadow">
            <Globe size={16} /> Get SEO advice
          </Link>
        </div>
      </div>

      {/* Feature cards */}
      <div className="max-w-4xl mx-auto px-6 pb-24 relative z-10 animate-fade-in-up delay-100">
        <div className="grid md:grid-cols-2 gap-6">
          <Link href="/location" className="group glass-card rounded-2xl p-8 hover:border-teal-500/30 hover:-translate-y-1.5 block relative overflow-hidden">
            {/* Ambient card background glow on hover */}
            <div className="absolute -right-10 -top-10 w-32 h-32 bg-teal-500/5 rounded-full blur-2xl group-hover:bg-teal-500/10 transition-all duration-300"></div>
            
            <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-100/80 flex items-center justify-center mb-6 group-hover:bg-teal-100 group-hover:border-teal-200 transition-all duration-300">
              <Building2 size={20} className="text-teal-600 group-hover:scale-110 transition-transform duration-300" />
            </div>
            <h2 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-1.5 group-hover:text-teal-800 transition-colors">
              Location Intelligence 
              <ArrowRight size={15} className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300 text-teal-600" />
            </h2>
            <p className="text-slate-500 text-xs leading-relaxed mb-6">
              Tell us your business type and target area. We'll score the location, map competitors,
              assess customer demographics, and suggest premium alternative spots.
            </p>
            <div className="flex flex-wrap gap-2">
              {['Viability score', 'Competitor map', 'Alternative spots', 'Market gap'].map(t => (
                <span key={t} className="text-[10px] bg-slate-50 border border-slate-200/60 text-slate-600 rounded-lg px-2.5 py-1 font-semibold group-hover:bg-teal-50/40 group-hover:border-teal-100/50 group-hover:text-teal-700 transition-colors duration-300">{t}</span>
              ))}
            </div>
          </Link>

          <Link href="/digital" className="group glass-card rounded-2xl p-8 hover:border-teal-500/30 hover:-translate-y-1.5 block relative overflow-hidden">
            {/* Ambient card background glow on hover */}
            <div className="absolute -right-10 -top-10 w-32 h-32 bg-teal-500/5 rounded-full blur-2xl group-hover:bg-teal-500/10 transition-all duration-300"></div>
            
            <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-100/80 flex items-center justify-center mb-6 group-hover:bg-teal-100 group-hover:border-teal-200 transition-all duration-300">
              <Search size={20} className="text-teal-600 group-hover:scale-110 transition-transform duration-300" />
            </div>
            <h2 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-1.5 group-hover:text-teal-800 transition-colors">
              Digital & SEO Advisor
              <ArrowRight size={15} className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300 text-teal-600" />
            </h2>
            <p className="text-slate-500 text-xs leading-relaxed mb-6">
              Enter your website URL to trigger a live audit. We will analyze your tech stack,
              generate targeted keyword strategies, and draft action plans for conversions.
            </p>
            <div className="flex flex-wrap gap-2">
              {['PageSpeed audit', 'Keyword planner', 'Tech stack check', 'Audience metrics'].map(t => (
                <span key={t} className="text-[10px] bg-slate-50 border border-slate-200/60 text-slate-600 rounded-lg px-2.5 py-1 font-semibold group-hover:bg-teal-50/40 group-hover:border-teal-100/50 group-hover:text-teal-700 transition-colors duration-300">{t}</span>
              ))}
            </div>
          </Link>
        </div>

        {/* How it works */}
        <div className="mt-16 glass-card rounded-2xl p-8 relative overflow-hidden animate-fade-in-up delay-200">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-500/30 via-teal-600/50 to-emerald-500/30"></div>
          <h2 className="text-lg font-bold text-slate-900 mb-10 text-center tracking-tight">How the Platform Works</h2>
          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Step separator lines for desktop screens */}
            <div className="hidden md:block absolute top-10 left-[16%] right-[16%] h-0.5 border-t border-dashed border-slate-200 -z-10"></div>
            
            {[
              { step: '01', icon: <Building2 size={16} />, title: 'Describe business profile', desc: 'Specify your industry, location preferences, target demographics, and initial budget limits.' },
              { step: '02', icon: <Search size={16} />, title: 'Fetch live market data', desc: 'We extract Google Places competitor density, tech stack signals, and local viability metrics.' },
              { step: '03', icon: <TrendingUp size={16} />, title: 'Synthesize AI audits', desc: 'Our backend models compile reports with scores, SWOT items, and clear action roadmaps.' },
            ].map(item => (
              <div key={item.step} className="flex flex-col items-center text-center group relative bg-white md:bg-transparent p-5 md:p-0 rounded-xl border border-slate-100 md:border-none shadow-sm md:shadow-none">
                <div className="text-[10px] font-bold text-teal-600 bg-teal-50 border border-teal-100/60 rounded-full px-2.5 py-0.5 mb-3">
                  Step {item.step}
                </div>
                <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-100/80 flex items-center justify-center text-teal-600 mb-4 group-hover:scale-105 group-hover:bg-teal-100 group-hover:text-teal-700 transition-all duration-300 shadow-sm">
                  {item.icon}
                </div>
                <h3 className="font-bold text-slate-800 mb-2 text-xs tracking-tight">{item.title}</h3>
                <p className="text-[11px] text-slate-500 leading-relaxed max-w-[200px]">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer badges */}
        <div className="flex flex-wrap justify-center items-center gap-3 mt-12 text-[10px] text-slate-500 font-bold tracking-wider uppercase">
          <span className="flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-200 rounded-full shadow-sm"><ShieldCheck size={13} className="text-teal-600" /> Data Guard RLS</span>
          <span className="hidden sm:inline text-slate-300">•</span>
          <span className="flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-200 rounded-full shadow-sm"><Database size={13} className="text-teal-600" /> Supabase Storage</span>
          <span className="hidden sm:inline text-slate-300">•</span>
          <span className="flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-200 rounded-full shadow-sm">Free Sandbox</span>
        </div>
      </div>
      <ChatWidget />
    </div>
  )
}
