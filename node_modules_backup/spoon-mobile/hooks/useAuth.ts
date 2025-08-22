import { useState, useEffect } from 'react'
import { supabase } from '../config/supabase'

interface User {
  id: string
  email: string
  name: string
  phone: string
  address: string
  avatar: string
  favoriteCategories: string[]
  initials: string
}

interface AuthState {
  user: User | null
  loading: boolean
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
  })

  useEffect(() => {
    // Verificar sesión inicial
    checkSession()
    
    // Escuchar cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          await loadUserProfile(session.user.id)
        } else {
          setAuthState({ user: null, loading: false })
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const checkSession = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        await loadUserProfile(session.user.id)
      } else {
        setAuthState({ user: null, loading: false })
      }
    } catch (error) {
      console.error('Error checking session:', error)
      setAuthState({ user: null, loading: false })
    }
  }

  const loadUserProfile = async (userId: string) => {
    try {
      const { data: profile } = await supabase
        .from('user_profiles_app')
        .select('*')
        .eq('id', userId)
        .single()

      if (profile) {
        const user: User = {
          id: profile.id,
          email: profile.email,
          name: profile.full_name || profile.email,
          phone: profile.phone || '',
          address: profile.address || '',
          avatar: profile.avatar_url || '',
          favoriteCategories: profile.favorite_categories || [],
          initials: getInitials(profile.full_name || profile.email),
        }
        setAuthState({ user, loading: false })
      } else {
        setAuthState({ user: null, loading: false })
      }
    } catch (error) {
      console.error('Error loading profile:', error)
      setAuthState({ user: null, loading: false })
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true }))
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (error) throw error
      return { success: true, error: null }
    } catch (error: any) {
      setAuthState(prev => ({ ...prev, loading: false }))
      return { success: false, error: error.message }
    }
  }

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true }))
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          }
        }
      })
      
      if (error) throw error
      return { success: true, error: null }
    } catch (error: any) {
      setAuthState(prev => ({ ...prev, loading: false }))
      return { success: false, error: error.message }
    }
  }

  const signOut = async () => {
    try {
      await supabase.auth.signOut()
      setAuthState({ user: null, loading: false })
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return {
    user: authState.user,
    loading: authState.loading,
    signIn,
    signUp,
    signOut,
    checkSession,
  }
}
