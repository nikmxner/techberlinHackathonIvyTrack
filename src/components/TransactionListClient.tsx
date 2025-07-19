'use client'

import { useState, useEffect, useCallback } from 'react'
import { TransactionDetails } from '@/components/TransactionDetails/DetailsPanel'

function formatTimestamp(timestamp: string | null) {
  if (!timestamp) return 'N/A'
  const date = new Date(timestamp)
  return new Intl.DateTimeFormat('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

function getStatusBadge(row: any) {
  if (row.event_failure_message || row.checkout_session_abort_reason) {
    return <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded">Fehler</span>
  }
  if (row.event_type?.includes('Succeeded') || row.event_type?.includes('Completed')) {
    return <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">Erfolg</span>
  }
  return <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded">Ausstehend</span>
}

function getTransactionStatus(transaction: any): 'success' | 'failed' | 'pending' {
  if (transaction.event_failure_message || transaction.checkout_session_abort_reason) {
    return 'failed'
  }
  if (transaction.event_type?.includes('Succeeded') || transaction.event_type?.includes('Completed')) {
    return 'success'
  }
  return 'pending'
}

interface TransactionListClientProps {
  transactions: any[]
  totalCount: number
}

export function TransactionListClient({ transactions: initialTransactions, totalCount: initialTotalCount }: TransactionListClientProps) {
  const [transactions, setTransactions] = useState(initialTransactions)
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [statusFilter, setStatusFilter] = useState({
    success: true,  // Show success by default
    failed: true,   // Show failed by default  
    pending: false  // Hide pending by default
  })
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: Math.ceil(initialTotalCount / 50),
    totalTransactions: initialTotalCount,
    itemsPerPage: 50,
    hasMore: initialTotalCount > 50,
    hasPrevious: false
  })

  // Load transactions with proper pagination
  const loadTransactions = useCallback(async (page = 1, search = searchQuery) => {
    setIsLoading(true)
    try {
      // Build status filter for API
      const activeStatuses = Object.entries(statusFilter)
        .filter(([_, active]) => active)
        .map(([status, _]) => status)
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '50', // ALWAYS 50 items per page
        search: search,
        merchant_id: 'merchant_008',
        status_filter: activeStatuses.join(',')
      })

      const response = await fetch(`/api/transactions?${params}`)
      
      if (!response.ok) {
        throw new Error('Failed to load transactions')
      }

      const data = await response.json()
      
      if (page === 1) {
        setTransactions(data.transactions || [])
      } else {
        setTransactions(prev => [...prev, ...(data.transactions || [])])
      }

      setPagination({
        currentPage: page,
        totalPages: data.pagination?.totalPages || 1,
        totalTransactions: data.pagination?.totalTransactions || 0,
        itemsPerPage: 50,
        hasMore: data.pagination?.hasMore || false,
        hasPrevious: page > 1
      })
    } catch (error) {
      console.error('Error loading transactions:', error)
    } finally {
      setIsLoading(false)
    }
  }, [statusFilter, searchQuery])

  // Reload when filters change
  useEffect(() => {
    loadTransactions(1)
  }, [statusFilter, loadTransactions])

  // Search handler
  const handleSearch = (query: string) => {
    setSearchQuery(query)
    loadTransactions(1, query)
  }

  // Status filter handler
  const handleStatusFilterChange = (status: 'success' | 'failed' | 'pending') => {
    setStatusFilter(prev => ({
      ...prev,
      [status]: !prev[status]
    }))
  }

  // Pagination handlers
  const loadNextPage = () => {
    if (pagination.hasMore && !isLoading) {
      loadTransactions(pagination.currentPage + 1)
    }
  }

  const loadPreviousPage = () => {
    if (pagination.hasPrevious && !isLoading) {
      loadTransactions(pagination.currentPage - 1)
    }
  }

  // Filter transactions client-side based on status (as backup)
  const filteredTransactions = transactions.filter(transaction => {
    const status = getTransactionStatus(transaction)
    return statusFilter[status]
  })

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-background">
      {/* Left Sidebar - Transaction List */}
      <div className="w-96 min-h-[calc(100vh-4rem)] border-r bg-background flex flex-col">
        <div className="p-4 border-b bg-background">
          <h2 className="text-lg font-semibold mb-4">
            {filteredTransactions.length} von {pagination.totalTransactions} Transaktionen
          </h2>
          
          {/* Search */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="Nach Transaction ID, User oder Event Typ suchen..."
              className="w-full px-3 py-2 border rounded-md text-sm"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>

          {/* Status Filter */}
          <div className="space-y-2">
            <div className="text-sm font-medium">Status Filter:</div>
            <div className="flex flex-col space-y-1">
              <label className="flex items-center space-x-2 text-sm">
                <input
                  type="checkbox"
                  checked={statusFilter.success}
                  onChange={() => handleStatusFilterChange('success')}
                />
                <span>Erfolg</span>
              </label>
              <label className="flex items-center space-x-2 text-sm">
                <input
                  type="checkbox"
                  checked={statusFilter.failed}
                  onChange={() => handleStatusFilterChange('failed')}
                />
                <span>Fehler</span>
              </label>
              <label className="flex items-center space-x-2 text-sm">
                <input
                  type="checkbox"
                  checked={statusFilter.pending}
                  onChange={() => handleStatusFilterChange('pending')}
                />
                <span>Ausstehend</span>
              </label>
            </div>
          </div>
        </div>
        
        <div className="flex-1 overflow-auto p-3 space-y-2">
          {isLoading && transactions.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              Lade Transaktionen...
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              Keine Transaktionen gefunden
            </div>
          ) : (
            filteredTransactions.map((transaction: any, index: number) => (
              <div
                key={`${transaction.transaction_id}-${transaction.event_index || index}`}
                className={`p-3 rounded-lg border cursor-pointer transition-all duration-150 hover:bg-muted/50 ${
                  selectedTransaction?.transaction_id === transaction.transaction_id
                    ? 'bg-primary/10 border-primary/30'
                    : 'border-border'
                }`}
                onClick={() => setSelectedTransaction(transaction)}
              >
                {/* Header Row */}
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-mono font-bold">
                      {transaction.transaction_id}
                    </span>
                    <span className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded">
                      #{transaction.event_index || '0'}
                    </span>
                  </div>
                  {getStatusBadge(transaction)}
                </div>

                {/* Event Type */}
                <div className="mb-1">
                  <div className="text-sm font-medium truncate">
                    {transaction.event_type || 'Unknown Event'}
                  </div>
                </div>

                {/* Amount and Merchant */}
                <div className="flex items-center justify-between mb-1">
                  <div className="text-sm font-medium">
                    {transaction.total_amount?.toFixed(2) || '0.00'} {transaction.currency || 'EUR'}
                  </div>
                  <div className="text-xs text-muted-foreground truncate max-w-[120px]">
                    {transaction.merchant_name || 'Unknown Merchant'}
                  </div>
                </div>

                {/* Timestamp and Device */}
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{formatTimestamp(transaction.time)}</span>
                  <span>{transaction.device_type || 'unknown'}</span>
                </div>

                {/* Error Message */}
                {transaction.event_failure_message && (
                  <div className="text-xs text-red-600 mt-2 p-2 bg-red-50 rounded">
                    {transaction.event_failure_message}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Pagination Controls */}
        <div className="p-4 border-t space-y-3">
          <div className="text-sm text-muted-foreground text-center">
            Seite {pagination.currentPage} von {pagination.totalPages}
          </div>
          <div className="flex gap-2">
            {pagination.hasPrevious && (
              <button
                onClick={loadPreviousPage}
                disabled={isLoading}
                className="flex-1 px-3 py-2 text-sm border rounded-md hover:bg-accent disabled:opacity-50"
              >
                ← Vorherige
              </button>
            )}
            {pagination.hasMore && (
              <button
                onClick={loadNextPage}
                disabled={isLoading}
                className="flex-1 px-3 py-2 text-sm border rounded-md hover:bg-accent disabled:opacity-50"
              >
                Weitere laden →
              </button>
            )}
          </div>
          {isLoading && (
            <div className="text-center text-sm text-muted-foreground">
              Laden...
            </div>
          )}
        </div>
      </div>

      {/* Right Panel - Transaction Details */}
      <div className="flex-1">
        {selectedTransaction ? (
          <TransactionDetails 
            transaction={selectedTransaction}
            onTransactionUpdate={() => {
              // Reload current page when transaction is updated
              loadTransactions(pagination.currentPage)
            }}
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-muted/20">
            <div className="text-center space-y-4">
              <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-medium">Keine Transaktion ausgewählt</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Wählen Sie eine Transaktion aus der Liste links aus, um Details anzuzeigen.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 