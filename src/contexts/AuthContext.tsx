'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { AuthContextType, AuthState, Merchant, UserMerchant } from '@/types/auth'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    userMerchants: [],
    currentMerchant: null,
    isAuthenticated: false,
  })

  const supabase = createClient()

  // SIMPLIFIED: No complex merchant loading in initial auth
  useEffect(() => {
    let mounted = true
    
    // Timeout to prevent infinite loading
    const loadingTimeout = setTimeout(() => {
      if (mounted) {
        setState(prev => ({ ...prev, loading: false }))
      }
    }, 5000) // 5 second max loading time

    async function getInitialSession() {
      try {
        const { data: { session } } = await supabase.auth.getSession()

        if (mounted) {
          clearTimeout(loadingTimeout)
          setState({
            user: session?.user || null,
            loading: false,
            userMerchants: [], // Will be loaded later
            currentMerchant: null, // Will be set later
            isAuthenticated: !!session?.user,
          })
        }
      } catch (error) {
        console.error('Auth error:', error)
        if (mounted) {
          clearTimeout(loadingTimeout)
          setState({
            user: null,
            loading: false,
            userMerchants: [],
            currentMerchant: null,
            isAuthenticated: false,
          })
        }
      }
    }

    getInitialSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (mounted) {
        clearTimeout(loadingTimeout)
        setState({
          user: session?.user || null,
          loading: false,
          userMerchants: [], // Will be loaded later
          currentMerchant: null, // Will be set later
          isAuthenticated: !!session?.user,
        })
      }
    })

    return () => {
      clearTimeout(loadingTimeout)
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  // SIMPLIFIED: Load merchants AFTER auth is established
  useEffect(() => {
    if (state.user && state.isAuthenticated && state.userMerchants.length === 0) {
      loadUserMerchants()
    }
  }, [state.user, state.isAuthenticated])

  const loadUserMerchants = async () => {
    if (!state.user) return

    try {
      const { data, error } = await supabase
        .from('user_merchants')
        .select('*')
        .eq('user_id', state.user.id)

      if (!error && data && data.length > 0) {
        // Transform merchant_id strings into merchant objects for compatibility
        const userMerchants = data.map(um => ({
          ...um,
          merchant: {
            id: um.merchant_id,
            name: um.merchant_id, // Use merchant_id as display name for now
            category: 'unknown',
            description: `Merchant ${um.merchant_id}`,
            status: 'active',
            created_at: um.created_at,
            updated_at: um.created_at,
          }
        }))

        const currentMerchant = userMerchants[0]?.merchant || null

        setState(prev => ({
          ...prev,
          userMerchants,
          currentMerchant,
        }))
      }
    } catch (error) {
      console.error('Error loading merchants:', error)
    }
  }

  const signIn = async (email: string) => {
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      return { error }
    } catch (error) {
      return { error: error as Error }
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      return { error }
    } catch (error) {
      return { error: error as Error }
    }
  }

  const setCurrentMerchant = (merchant: Merchant) => {
    setState(prev => ({
      ...prev,
      currentMerchant: merchant,
    }))
  }

  const refreshUserMerchants = async () => {
    await loadUserMerchants()
  }

  const value: AuthContextType = {
    ...state,
    signIn,
    signOut,
    setCurrentMerchant,
    refreshUserMerchants,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
} 