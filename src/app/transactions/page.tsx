'use client'

import { useState, useEffect } from 'react'
import { TransactionFeed } from '@/components/TransactionFeed/TransactionList'
import { TransactionDetails } from '@/components/TransactionDetails/DetailsPanel'
import { Transaction, TransactionFeedState, TransactionFilters } from '@/types/transactions'

// Mock data for demo purposes
const generateMockTransactions = (): Transaction[] => {
  const transactions: Transaction[] = []
  const now = new Date()
  
  // Generate mostly successful transactions (98.4%)
  for (let i = 0; i < 200; i++) {
    const timestamp = new Date(now.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000) // Last 7 days
    
    transactions.push({
      id: `txn_${Date.now()}_${i}`,
      status: 'success',
      timestamp,
      type: 'payment',
      amount: Math.floor(Math.random() * 1000) + 10,
      currency: 'EUR',
      metadata: {
        userId: `user_${Math.floor(Math.random() * 1000)}`,
        paymentMethod: ['card', 'paypal', 'bank_transfer'][Math.floor(Math.random() * 3)],
        merchantId: `merchant_${Math.floor(Math.random() * 100)}`
      },
      endpoint: '/api/payments/process',
      duration: Math.floor(Math.random() * 2000) + 100,
      responseCode: 200
    })
  }
  
  // Generate failed transactions (1.6%)
  const errorMessages = [
    'Payment declined by bank',
    'Insufficient funds',
    'Invalid card number',
    'Network timeout',
    'Database connection failed',
    'Authentication failed',
    'Rate limit exceeded',
    'Invalid request format'
  ]
  
  const errorCategories = ['network', 'validation', 'authentication', 'database', 'timeout'] as const
  
  for (let i = 0; i < 8; i++) {
    const timestamp = new Date(now.getTime() - Math.random() * 24 * 60 * 60 * 1000) // Last 24 hours
    const errorCategory = errorCategories[Math.floor(Math.random() * errorCategories.length)]
    const errorMessage = errorMessages[Math.floor(Math.random() * errorMessages.length)]
    
    transactions.push({
      id: `txn_failed_${Date.now()}_${i}`,
      status: 'failed',
      timestamp,
      type: 'payment',
      amount: Math.floor(Math.random() * 500) + 20,
      currency: 'EUR',
      errorMessage,
      errorCategory,
      stackTrace: `Error: ${errorMessage}\n    at PaymentProcessor.process (/app/payment.js:123:45)\n    at /app/routes/payment.js:67:12\n    at processTicksAndRejections (internal/process/task_queues.js:95:5)`,
      isResolved: Math.random() > 0.5,
      retryCount: Math.floor(Math.random() * 3),
      metadata: {
        userId: `user_${Math.floor(Math.random() * 1000)}`,
        paymentMethod: ['card', 'paypal', 'bank_transfer'][Math.floor(Math.random() * 3)],
        merchantId: `merchant_${Math.floor(Math.random() * 100)}`,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      endpoint: '/api/payments/process',
      duration: Math.floor(Math.random() * 5000) + 1000,
      responseCode: [400, 401, 403, 404, 500, 502, 503, 504][Math.floor(Math.random() * 8)]
    })
  }
  
  // Sort by timestamp (newest first)
  return transactions.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
}

export default function TransactionsPage() {
  const [feedState, setFeedState] = useState<TransactionFeedState>({
    transactions: [],
    selectedTransaction: null,
    filters: {},
    isLoading: true,
    stats: {
      total: 0,
      successful: 0,
      failed: 0,
      pending: 0,
      successRate: 0,
      avgDuration: 0,
      errorsByCategory: {
        network: 0,
        validation: 0,
        authentication: 0,
        database: 0,
        timeout: 0,
        unknown: 0
      }
    }
  })

  // Load mock data
  useEffect(() => {
    const loadTransactions = async () => {
      // Simulate API loading
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const transactions = generateMockTransactions()
      const successful = transactions.filter(t => t.status === 'success').length
      const failed = transactions.filter(t => t.status === 'failed').length
      const pending = transactions.filter(t => t.status === 'pending').length
      
      const errorsByCategory = transactions
        .filter(t => t.status === 'failed')
        .reduce((acc, t) => {
          const category = t.errorCategory || 'unknown'
          acc[category] = (acc[category] || 0) + 1
          return acc
        }, {} as Record<string, number>)
      
      const avgDuration = transactions
        .filter(t => t.duration)
        .reduce((sum, t) => sum + (t.duration || 0), 0) / transactions.length
      
      setFeedState({
        transactions,
        selectedTransaction: null,
        filters: {},
        isLoading: false,
        stats: {
          total: transactions.length,
          successful,
          failed,
          pending,
          successRate: (successful / transactions.length) * 100,
          avgDuration: Math.round(avgDuration),
          errorsByCategory: errorsByCategory as any
        }
      })
    }
    
    loadTransactions()
  }, [])

  const handleTransactionSelect = (transaction: Transaction) => {
    setFeedState(prev => ({
      ...prev,
      selectedTransaction: transaction
    }))
  }

  const handleFiltersChange = (filters: TransactionFilters) => {
    setFeedState(prev => ({
      ...prev,
      filters
    }))
  }

  const handleTransactionUpdate = (updatedTransaction: Transaction) => {
    setFeedState(prev => ({
      ...prev,
      transactions: prev.transactions.map(t => 
        t.id === updatedTransaction.id ? updatedTransaction : t
      ),
      selectedTransaction: updatedTransaction
    }))
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-background">
      {/* Left Sidebar - Transaction Feed */}
      <div className="w-80 border-r bg-background">
        <TransactionFeed
          transactions={feedState.transactions}
          selectedTransaction={feedState.selectedTransaction}
          filters={feedState.filters}
          stats={feedState.stats}
          isLoading={feedState.isLoading}
          onTransactionSelect={handleTransactionSelect}
          onFiltersChange={handleFiltersChange}
        />
      </div>

      {/* Right Panel - Transaction Details */}
      <div className="flex-1">
        <TransactionDetails
          transaction={feedState.selectedTransaction}
          onTransactionUpdate={handleTransactionUpdate}
        />
      </div>
    </div>
  )
} 