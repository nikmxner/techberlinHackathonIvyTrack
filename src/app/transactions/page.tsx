'use client'

import { useState, useEffect, useCallback } from 'react'
import { TransactionList } from '@/components/TransactionFeed/TransactionList'
import { TransactionDetails } from '@/components/TransactionDetails/DetailsPanel'
import { Transaction, TransactionStats } from '@/types/transactions'
import { TabNavigation } from '@/components/TabNavigation'

interface PaginationInfo {
  currentPage: number
  totalPages: number
  totalTransactions: number
  itemsPerPage: number
  hasMore: boolean
  hasPrevious: boolean
}

function TransactionsPageContent() {
  const [state, setState] = useState<{
    transactions: Transaction[]
    selectedTransaction: Transaction | null
    pagination: PaginationInfo
    isLoading: boolean
    searchQuery: string
    error?: string
    stats: TransactionStats
  }>({
    transactions: [],
    selectedTransaction: null,
    pagination: {
      currentPage: 1,
      totalPages: 1,
      totalTransactions: 0,
      itemsPerPage: 50,
      hasMore: false,
      hasPrevious: false
    },
    isLoading: true,
    searchQuery: '',
    stats: {
      total: 0,
      successful: 0,
      failed: 0,
      pending: 0,
      successRate: 0,
      avgAmount: 0,
      totalVolume: 0,
      errorsByCategory: {
        network: 0,
        validation: 0,
        authentication: 0,
        database: 0,
        timeout: 0,
        payment: 0,
        checkout: 0,
        unknown: 0
      },
      byDeviceType: {},
      byCurrency: {}
    }
  })

  // Load transactions with filtering
  const loadTransactions = useCallback(async (page = 1, searchQuery = '') => {
    setState(prev => ({ ...prev, isLoading: true, error: undefined }))

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '50',
        search: searchQuery,
        // Use hardcoded merchant for now since we have merchant_008 and merchant_007 access
        merchant_id: 'merchant_008' // TODO: Get from user selection
      })

      const response = await fetch(`/api/transactions?${params}`)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to load transactions')
      }

      const data = await response.json()
      
      setState(prev => ({
        ...prev,
        transactions: data.transactions || [],
        pagination: data.pagination || prev.pagination,
        stats: data.stats || prev.stats,
        isLoading: false
      }))

      // Select first transaction if none selected and we have transactions
      if (data.transactions?.length > 0) {
        setState(prev => ({
          ...prev,
          selectedTransaction: prev.selectedTransaction || data.transactions[0]
        }))
      }

    } catch (error) {
      console.error('Failed to load transactions:', error)
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load transactions'
      }))
    }
  }, [])

  // Initial load
  useEffect(() => {
    loadTransactions()
  }, [])

  const handleTransactionSelect = (transaction: Transaction) => {
    setState(prev => ({ ...prev, selectedTransaction: transaction }))
  }

  const handlePageChange = (page: number) => {
    loadTransactions(page, state.searchQuery)
  }

  const handleSearchChange = (query: string) => {
    setState(prev => ({ ...prev, searchQuery: query }))
    loadTransactions(1, query)
  }

  const handleRefresh = () => {
    loadTransactions(state.pagination.currentPage, state.searchQuery)
  }

  return (
    <div className="min-h-screen bg-background">
      <TabNavigation />
      
      {/* Main Content */}
      <div className="flex h-[calc(100vh-64px)] bg-background">
        {/* Left Sidebar - Transaction List with Pagination */}
        <div className="w-96 border-r border-border">
          <TransactionList
            transactions={state.transactions}
            selectedTransaction={state.selectedTransaction}
            currentPage={state.pagination.currentPage}
            totalPages={state.pagination.totalPages}
            totalTransactions={state.pagination.totalTransactions}
            itemsPerPage={state.pagination.itemsPerPage}
            isLoading={state.isLoading}
            searchQuery={state.searchQuery}
            onTransactionSelect={handleTransactionSelect}
            onPageChange={handlePageChange}
            onSearchChange={handleSearchChange}
            onRefresh={handleRefresh}
          />
        </div>
        
        {/* Right Panel - Transaction Details */}
        <div className="flex-1">
          <TransactionDetails
            transaction={state.selectedTransaction}
            onTransactionUpdate={() => {}} // Not used in current implementation
          />
        </div>
      </div>
    </div>
  )
}

export default function TransactionsPage() {
  return <TransactionsPageContent />
} 