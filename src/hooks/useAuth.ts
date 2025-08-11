import { useState, useEffect } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Récupérer la session courante
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Écouter les changements d'auth
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('🔍 DEBUG: Auth state change:', { event, session: session ? 'exists' : 'null', userId: session?.user?.id })
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { data, error }
  }

  const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })
    return { data, error }
  }

  const signInWithGoogle = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`
      }
    })
    return { data, error }
  }

  const signOut = async () => {
    console.log('🔍 DEBUG: useAuth.signOut called')
    try {
      const { error } = await supabase.auth.signOut()
      console.log('🔍 DEBUG: supabase.auth.signOut result:', { error })
      
      // Gérer l'erreur "Auth session missing"
      if (error && error.message?.includes('Auth session missing')) {
        console.log('⚠️ Session manquante - clearing local state manually')
        // Forcer la mise à jour locale même si Supabase échoue
        setSession(null)
        setUser(null)
        // Ne pas retourner l'erreur car on a géré le cas
        return { error: null }
      }
      
      if (error) {
        console.error('❌ Supabase signOut error:', error)
      } else {
        console.log('✅ Supabase signOut successful')
      }
      return { error }
    } catch (exception) {
      console.error('❌ Supabase signOut exception:', exception)
      // En cas d'exception, forcer le clear local
      setSession(null)
      setUser(null)
      return { error: exception }
    }
  }

  const resetPassword = async (email: string) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    })
    return { data, error }
  }

  return {
    session,
    user,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    resetPassword,
  }
}
