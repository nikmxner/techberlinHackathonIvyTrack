export type TransactionStatus = 'success' | 'failed' | 'pending'
export type ErrorCategory = 'network' | 'validation' | 'authentication' | 'database' | 'timeout' | 'unknown'

export interface Transaction {
  id: string
  status: TransactionStatus
  timestamp: Date | string
  type: string
  amount?: number
  currency?: string
  errorMessage?: string
  errorCategory?: ErrorCategory
  stackTrace?: string
  resolutionSteps?: string[]
  isResolved?: boolean
  retryCount?: number
  metadata: Record<string, any>
  userId?: string
  endpoint?: string
  duration?: number
  responseCode?: number
}

export interface TransactionFilters {
  status?: TransactionStatus[]
  category?: ErrorCategory[]
  dateRange?: {
    start: Date
    end: Date
  }
  search?: string
  showResolved?: boolean
}

export interface TransactionStats {
  total: number
  successful: number
  failed: number
  pending: number
  successRate: number
  avgDuration: number
  errorsByCategory: Record<ErrorCategory, number>
}

export interface ResolutionGuide {
  id: string
  transactionId: string
  category: ErrorCategory
  title: string
  description: string
  steps: ResolutionStep[]
  estimatedTime: string
  difficulty: 'easy' | 'medium' | 'hard'
  relatedDocs: DocumentationLink[]
  generatedAt: Date
}

export interface ResolutionStep {
  id: string
  title: string
  description: string
  code?: string
  isCompleted?: boolean
  notes?: string
}

export interface DocumentationLink {
  title: string
  url: string
  type: 'api' | 'guide' | 'troubleshooting' | 'faq'
}

export interface TransactionFeedState {
  transactions: Transaction[]
  selectedTransaction: Transaction | null
  filters: TransactionFilters
  isLoading: boolean
  error?: string
  stats: TransactionStats
}

export interface AIResolutionRequest {
  transactionId: string
  errorMessage: string
  errorCategory: ErrorCategory
  stackTrace?: string
  metadata?: Record<string, any>
}

export interface AIResolutionResponse {
  guide: ResolutionGuide
  confidence: number
  additionalContext?: string
} 