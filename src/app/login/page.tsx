'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Card, FormField, inputClass } from '@/components/ui/shared'
import { Loader2, Chrome, KeyRound, Mail, UserPlus, LogIn, TrendingUp } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [message, setMessage] = useState({ text: '', type: '' })
  const [showConfigWarning, setShowConfigWarning] = useState(false)

  useEffect(() => {
    const isPlaceholder = 
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder') ||
      (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY && !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) ||
      (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.includes('placeholder') || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.includes('placeholder'))
    
    if (isPlaceholder) {
      setShowConfigWarning(true)
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.replace('/dashboard')
      }
    })
  }, [router])

  async function handleEmailAuth(e: React.FormEvent) {
    e.preventDefault()
    if (showConfigWarning) {
      setMessage({ text: 'Please configure your Supabase credentials in .env.local first.', type: 'error' })
      return
    }
    if (!email || !password) {
      setMessage({ text: 'Please fill in all fields.', type: 'error' })
      return
    }
    setMessage({ text: '', type: '' })
    setLoading(true)

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin + '/auth/callback'
          }
        })
        if (error) throw error
        setMessage({ text: 'Sign up successful! Please check your email for the confirmation link.', type: 'success' })
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        router.replace('/dashboard')
      }
    } catch (err: any) {
      const msg = err.message || ''
      if (msg.toLowerCase().includes('failed to fetch')) {
        setMessage({
          text: 'Unable to connect to the database (Failed to fetch). If you are on Supabase free tier, your project may be paused due to inactivity. Please restore/unpause it from your Supabase dashboard.',
          type: 'error'
        })
      } else {
        setMessage({ text: msg || 'Authentication failed.', type: 'error' })
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogleLogin() {
    if (showConfigWarning) {
      setMessage({ text: 'Please configure your Supabase credentials in .env.local first.', type: 'error' })
      return
    }
    setMessage({ text: '', type: '' })
    setGoogleLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + '/auth/callback'
        }
      })
      if (error) throw error
    } catch (err: any) {
      const msg = err.message || ''
      if (msg.toLowerCase().includes('failed to fetch')) {
        setMessage({
          text: 'Unable to connect to the database (Failed to fetch). Please check if your Supabase project is active/unpaused.',
          type: 'error'
        })
      } else {
        setMessage({ text: msg || 'Google authentication failed.', type: 'error' })
      }
      setGoogleLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-transparent flex items-center justify-center p-6 font-sans relative">
      <div className="absolute top-8 left-8 flex items-center gap-2">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center shadow-lg shadow-teal-500/10">
          <TrendingUp size={15} className="text-white" />
        </div>
        <span className="font-bold tracking-tight text-slate-900 text-base">
          Biz<span className="text-teal-600 font-extrabold">Boost</span>
        </span>
      </div>

      <Card className="w-full max-w-md shadow-xl p-8 relative overflow-hidden animate-scale-in">
        <div className="absolute -top-12 -right-12 w-24 h-24 bg-teal-500/5 rounded-full blur-2xl"></div>
        <div className="absolute -bottom-12 -left-12 w-24 h-24 bg-teal-600/5 rounded-full blur-2xl"></div>

        <div className="text-center mb-6 relative z-10">
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {isSignUp ? 'Create Account' : 'Welcome Back'}
          </h1>
          <p className="text-xs text-slate-500 mt-2 leading-relaxed max-w-[280px] mx-auto font-medium">
            {isSignUp ? 'Get started by creating a secure account for your business profiles' : 'Sign in to access your saved reports, location analysis and consultations'}
          </p>
        </div>

        {showConfigWarning && (
          <div className="mb-5 p-4 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-xl leading-relaxed relative z-10 font-medium">
            <span className="font-bold uppercase tracking-wider block mb-1">Configuration Needed</span>
            Add your actual <strong className="text-slate-900">NEXT_PUBLIC_SUPABASE_URL</strong> and <strong className="text-slate-900">NEXT_PUBLIC_SUPABASE_ANON_KEY</strong> to your <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">.env.local</code> to enable authentication.
          </div>
        )}

        {message.text && (
          <div className={`mb-5 p-3.5 rounded-xl text-xs font-semibold relative z-10 ${
            message.type === 'error' ? 'bg-red-50 border border-red-200 text-red-700' : 'bg-teal-50 border border-teal-200 text-teal-800'
          }`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleEmailAuth} className="space-y-4 mb-6 relative z-10">
          <FormField label="Email Address">
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-slate-400" size={15} />
              <input
                type="email"
                placeholder="you@example.com"
                className={`${inputClass} pl-10`}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading || googleLoading}
              />
            </div>
          </FormField>

          <FormField label="Password">
            <div className="relative">
              <KeyRound className="absolute left-3 top-3 text-slate-400" size={15} />
              <input
                type="password"
                placeholder="••••••••"
                className={`${inputClass} pl-10`}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading || googleLoading}
              />
            </div>
          </FormField>

          <button
            type="submit"
            disabled={loading || googleLoading}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-550 hover:to-teal-650 active:scale-98 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl text-xs transition-all shadow-lg shadow-teal-500/10"
          >
            {loading ? (
              <><Loader2 size={14} className="animate-spin text-white" /> Processing...</>
            ) : isSignUp ? (
              <><UserPlus size={14} /> Sign Up with Email</>
            ) : (
              <><LogIn size={14} /> Sign In with Email</>
            )}
          </button>
        </form>

        <div className="relative flex items-center justify-center mb-6 z-10">
          <span className="absolute left-0 w-full h-[1px] bg-slate-100"></span>
          <span className="relative bg-white px-3 text-[10px] text-slate-400 uppercase tracking-widest font-bold">Or continue with</span>
        </div>

        <button
          onClick={handleGoogleLogin}
          disabled={loading || googleLoading}
          className="w-full flex items-center justify-center gap-2 border border-slate-200 bg-white hover:bg-slate-50 active:scale-98 disabled:opacity-50 text-slate-700 font-bold py-3.5 rounded-xl text-xs transition-all relative z-10 shadow-sm"
        >
          {googleLoading ? (
            <Loader2 size={16} className="animate-spin text-teal-600" />
          ) : (
            <Chrome size={16} className="text-teal-600" />
          )}
          Sign In with Google
        </button>

        <div className="text-center mt-6 pt-5 border-t border-slate-100 text-xs text-slate-500 relative z-10">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            onClick={() => {
              setIsSignUp(!isSignUp)
              setMessage({ text: '', type: '' })
            }}
            className="text-teal-600 hover:text-teal-700 font-bold transition-colors"
          >
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </button>
        </div>
      </Card>
    </div>
  )
}
