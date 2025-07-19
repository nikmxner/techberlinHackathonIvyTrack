'use client'

import { useState } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { 
  Search, 
  Filter, 
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle
} from 'lucide-react'
import { Transaction, TransactionFilters, TransactionStats } from '@/types/transactions'
import { SuccessItem } from './SuccessItem'
import { FailedItem } from './FailedItem'

interface TransactionFeedProps {
  transactions: Transaction[]
  selectedTransaction: Transaction | null
  filters: TransactionFilters
  stats: TransactionStats
  isLoading: boolean
  onTransactionSelect: (transaction: Transaction) => void
  onFiltersChange: (filters: TransactionFilters) => void
}

export function TransactionFeed({
  transactions,
  selectedTransaction,
  filters,
  stats,
  isLoading,
  onTransactionSelect,
  onFiltersChange
}: TransactionFeedProps) {
  const [searchQuery, setSearchQuery] = useState('')

  // Filter transactions based on current filters and search
  const filteredTransactions = transactions.filter(transaction => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      if (!transaction.id.toLowerCase().includes(query) &&
          !transaction.errorMessage?.toLowerCase().includes(query) &&
          !transaction.metadata.userId?.toLowerCase().includes(query)) {
        return false
      }
    }

    // Status filter
    if (filters.status && filters.status.length > 0) {
      if (!filters.status.includes(transaction.status)) {
        return false
      }
    }

    // Category filter (for failed transactions)
    if (filters.category && filters.category.length > 0) {
      if (!transaction.errorCategory || !filters.category.includes(transaction.errorCategory)) {
        return false
      }
    }

    // Show resolved filter
    if (filters.showResolved === false && transaction.isResolved) {
      return false
    }

    return true
  })

  // Separate successful and failed transactions for display priority
  const successfulTransactions = filteredTransactions.filter(t => t.status === 'success')
  const failedTransactions = filteredTransactions.filter(t => t.status === 'failed')
  const pendingTransactions = filteredTransactions.filter(t => t.status === 'pending')

  const handleStatusFilter = (status: string, checked: boolean) => {
    const currentStatus = filters.status || []
    const newStatus = checked
      ? [...currentStatus, status as any]
      : currentStatus.filter(s => s !== status)
    
    onFiltersChange({
      ...filters,
      status: newStatus.length > 0 ? newStatus : undefined
    })
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />
      default:
        return null
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Transaction Logs</h2>
          <Button variant="outline" size="sm">
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 gap-2">
          <div className="text-center p-2 bg-green-50 rounded border">
            <div className="text-sm font-bold text-green-700">{stats.successRate.toFixed(1)}%</div>
            <div className="text-xs text-green-600">Erfolgreich</div>
          </div>
          <div className="text-center p-2 bg-red-50 rounded border">
            <div className="text-sm font-bold text-red-700">{stats.failed}</div>
            <div className="text-xs text-red-600">Fehler</div>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Transaktionen durchsuchen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="w-3 h-3 mr-1" />
                Status
                {filters.status && filters.status.length > 0 && (
                  <Badge variant="secondary" className="ml-1 h-4 text-xs">
                    {filters.status.length}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuLabel>Status filtern</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem
                checked={filters.status?.includes('success') || false}
                onCheckedChange={(checked) => handleStatusFilter('success', checked)}
              >
                <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                Erfolgreich
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={filters.status?.includes('failed') || false}
                onCheckedChange={(checked) => handleStatusFilter('failed', checked)}
              >
                <XCircle className="w-4 h-4 mr-2 text-red-500" />
                Fehlgeschlagen
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={filters.status?.includes('pending') || false}
                onCheckedChange={(checked) => handleStatusFilter('pending', checked)}
              >
                <Clock className="w-4 h-4 mr-2 text-yellow-500" />
                Ausstehend
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Clear filters */}
          {(filters.status?.length || searchQuery) && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => {
                setSearchQuery('')
                onFiltersChange({})
              }}
            >
              Zurücksetzen
            </Button>
          )}
        </div>
      </div>

      {/* Transaction List */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Lade Transaktionen...
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Keine Transaktionen gefunden
            </div>
          ) : (
            <div className="space-y-1">
              {/* Failed transactions first (prominent) */}
              {failedTransactions.length > 0 && (
                <div className="space-y-1">
                  <div className="flex items-center gap-2 px-2 py-1 text-xs font-medium text-red-700 bg-red-50 rounded">
                    <AlertTriangle className="w-3 h-3" />
                    <span>Fehlgeschlagene Transaktionen ({failedTransactions.length})</span>
                  </div>
                  {failedTransactions.map(transaction => (
                    <FailedItem
                      key={transaction.id}
                      transaction={transaction}
                      isSelected={selectedTransaction?.id === transaction.id}
                      onSelect={() => onTransactionSelect(transaction)}
                    />
                  ))}
                </div>
              )}

              {/* Pending transactions */}
              {pendingTransactions.length > 0 && (
                <div className="space-y-1">
                  <div className="flex items-center gap-2 px-2 py-1 text-xs font-medium text-yellow-700 bg-yellow-50 rounded">
                    <Clock className="w-3 h-3" />
                    <span>Ausstehende Transaktionen ({pendingTransactions.length})</span>
                  </div>
                  {pendingTransactions.map(transaction => (
                    <SuccessItem
                      key={transaction.id}
                      transaction={transaction}
                      isSelected={selectedTransaction?.id === transaction.id}
                      onSelect={() => onTransactionSelect(transaction)}
                    />
                  ))}
                </div>
              )}

              {/* Successful transactions (minimal display) */}
              {successfulTransactions.length > 0 && (
                <div className="space-y-1">
                  <div className="flex items-center gap-2 px-2 py-1 text-xs font-medium text-green-700 bg-green-50 rounded">
                    <CheckCircle className="w-3 h-3" />
                    <span>Erfolgreiche Transaktionen ({successfulTransactions.length})</span>
                  </div>
                  {successfulTransactions.slice(0, 50).map(transaction => (
                    <SuccessItem
                      key={transaction.id}
                      transaction={transaction}
                      isSelected={selectedTransaction?.id === transaction.id}
                      onSelect={() => onTransactionSelect(transaction)}
                    />
                  ))}
                  {successfulTransactions.length > 50 && (
                    <div className="text-xs text-muted-foreground text-center py-2">
                      ... und {successfulTransactions.length - 50} weitere erfolgreiche Transaktionen
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
} 