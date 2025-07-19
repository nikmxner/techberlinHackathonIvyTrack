import { User } from '@supabase/supabase-js'

export interface Merchant {
  id: string
  name: string
  category: string | null
  description: string | null
  website: string | null
  logo_url: string | null
  status: 'active' | 'inactive'
  created_at: string
  updated_at: string
}

export interface UserMerchant {
  id: string
  user_id: string
  merchant_id: string
  role: 'admin' | 'manager' | 'viewer'
  created_at: string
  merchant?: Merchant
}

export interface AuthState {
  user: User | null
  loading: boolean
  userMerchants: UserMerchant[]
  currentMerchant: Merchant | null
  isAuthenticated: boolean
}

export interface AuthContextType extends AuthState {
  signIn: (email: string) => Promise<{ error: Error | null }>
  signOut: () => Promise<{ error: Error | null }>
  setCurrentMerchant: (merchant: Merchant) => void
  refreshUserMerchants: () => Promise<void>
} 