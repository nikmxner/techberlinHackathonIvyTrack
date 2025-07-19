export type TransactionStatus = 'success' | 'failed' | 'pending'
export type ErrorCategory = 'network' | 'validation' | 'authentication' | 'database' | 'timeout' | 'payment' | 'checkout' | 'unknown'

// Basis Transaction Interface basierend auf basic_paying_flow Schema
export interface Transaction {
  // Primary identifiers
  transaction_id: string
  event_index: string | null
  
  // Status und Event Details
  event_type: string | null
  time: Date | string | null
  session_start_time: Date | string | null
  
  // Merchant Informationen
  merchant_id: string | null
  merchant_name: string | null
  merchant_category: string | null
  merchant_requested_locale: string | null
  merchant_requested_market: string | null
  
  // Payment Details
  total_amount: number | null
  payment_amount: string | null
  currency: string | null
  pis_payment_reference: string | null
  
  // User Details
  user_id: string | null
  user_location: string | null
  
  // Session & Device Details
  browser: string | null
  device_type: string | null
  language: string | null
  is_guest_mode: boolean | null
  is_returning_user: boolean | null
  is_express: boolean | null
  is_phone_required: boolean | null
  guest_present: boolean | null
  token_present: boolean | null
  token_version: string | null
  
  // Error & Failure Information
  event_failure_message: string | null
  checkout_session_abort_reason: string | null
  checkout_session_status_change_reason: string | null
  
  // Chatbot Information
  chatbot_available: string | null
  chatbot_query: string | null
  chatbot_response: string | null
  help_requested: string | null
  
  // Computed fields for UI
  status?: TransactionStatus
  errorCategory?: ErrorCategory
  resolutionSteps?: string[]
  isResolved?: boolean
  retryCount?: number
  duration?: number
}

export interface TransactionFilters {
  status?: TransactionStatus[]
  event_type?: string[]
  currency?: string[]
  errorCategory?: ErrorCategory[]
  dateRange?: {
    start: Date
    end: Date
  }
  search?: string
  showResolved?: boolean
  device_type?: string[]
  is_guest_mode?: boolean
  has_errors?: boolean
}

export interface TransactionStats {
  total: number
  successful: number
  failed: number
  pending: number
  successRate: number
  avgAmount: number
  totalVolume: number
  errorsByCategory: Record<ErrorCategory, number>
  byDeviceType: Record<string, number>
  byCurrency: Record<string, number>
}

export interface ResolutionGuide {
  id: string
  transactionId: string
  category: ErrorCategory
  title: string
  description: string
  estimatedTime: string
  difficulty: 'easy' | 'medium' | 'hard'
  steps: ResolutionStep[]
  relatedDocs: string[]
  automationAvailable?: boolean
}

export interface ResolutionStep {
  id: string
  title: string
  description: string
  action?: string
  expected_result?: string
  troubleshooting_tips?: string[]
}

// Helper type für API Pagination
export interface TransactionQuery {
  limit?: number
  offset?: number
  orderBy?: 'time' | 'total_amount'
  orderDirection?: 'asc' | 'desc'
  filters?: TransactionFilters
} 