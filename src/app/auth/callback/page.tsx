'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Loader2 } from 'lucide-react'

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    // Listen for auth state change (e.g. token parsed from URL)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        router.replace('/dashboard')
      }
    })

    // Fallback: check session directly after a small delay
    const timer = setTimeout(async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        router.replace('/dashboard')
      } else {
        router.replace('/login')
      }
    }, 2500)

    return () => {
      subscription.unsubscribe()
      clearTimeout(timer)
    }
  }, [router])

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
      <Loader2 size={32} className="animate-spin text-brand-500 mb-3" />
      <h2 className="text-sm font-semibold text-gray-800 font-sans">Completing sign-in...</h2>
      <p className="text-xs text-gray-400 mt-1 font-sans">Please wait while we establish your secure session.</p>
    </div>
  )
}
