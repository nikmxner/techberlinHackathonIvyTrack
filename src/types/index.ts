export interface PromptHistoryItem {
  id: string
  prompt: string
  sqlQuery?: string
  timestamp: Date | string
  executionTime?: number
  status: 'success' | 'error' | 'pending'
  resultCount?: number
  chartTypes?: string[]
  isFavorite: boolean
  tags?: string[]
  createdAt?: Date | string
  updatedAt?: Date | string
}

export interface QueryResult {
  data: Record<string, any>[]
  columns: string[]
  rowCount: number
  executionTime: number
}

export interface ChartConfig {
  type: 'line' | 'bar' | 'area' | 'pie' | 'scatter'
  xAxis?: string
  yAxis?: string
  dataKey?: string
  title?: string
}

export interface DashboardState {
  queryResult?: QueryResult
  charts: ChartConfig[]
  isLoading: boolean
  error?: string
}

export interface LocalStorageHistory {
  items: PromptHistoryItem[]
  lastSync: Date
}

export interface HistoryFilters {
  search?: string
  status?: PromptHistoryItem['status'][]
  dateRange?: {
    start: Date
    end: Date
  }
  favorites?: boolean
  tags?: string[]
}

export interface HistoryCategory {
  label: string
  items: PromptHistoryItem[]
  count: number
}

export type SortOrder = 'asc' | 'desc'
export type SortField = 'timestamp' | 'prompt' | 'status' | 'executionTime'

export interface HistorySort {
  field: SortField
  order: SortOrder
}

export interface AIAgent {
  id: string
  name: string
  description: string
  isActive: boolean
}

export interface QueryGenerationRequest {
  prompt: string
  context?: Record<string, any>
  agentId?: string
}

export interface QueryGenerationResponse {
  sqlQuery: string
  explanation: string
  estimatedComplexity: 'low' | 'medium' | 'high'
  suggestedCharts: ChartConfig[]
} 