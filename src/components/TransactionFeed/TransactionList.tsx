'use client'

import { Transaction } from '@/types/transactions'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Search, 
  ChevronLeft, 
  ChevronRight,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface TransactionListProps {
  transactions: Transaction[]
  selectedTransaction: Transaction | null
  currentPage: number
  totalPages: number
  totalTransactions: number
  itemsPerPage: number
  isLoading: boolean
  searchQuery: string
  onTransactionSelect: (transaction: Transaction) => void
  onPageChange: (page: number) => void
  onSearchChange: (query: string) => void
  onRefresh: () => void
}

export function TransactionList({
  transactions,
  selectedTransaction,
  currentPage,
  totalPages,
  totalTransactions,
  itemsPerPage,
  isLoading,
  searchQuery,
  onTransactionSelect,
  onPageChange,
  onSearchChange,
  onRefresh
}: TransactionListProps) {

  const formatTimestamp = (timestamp: Date | string | null) => {
    if (!timestamp) return 'N/A'
    const date = timestamp instanceof Date ? timestamp : new Date(timestamp)
    return new Intl.DateTimeFormat('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  const formatAmount = (amount: number | null, currency: string | null) => {
    if (!amount) return 'N/A'
    return `${amount.toFixed(2)} ${currency || ''}`
  }

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />
      default:
        return <div className="w-4 h-4 rounded-full bg-gray-300" />
    }
  }

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'success':
        return <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">Erfolg</Badge>
      case 'failed':
        return <Badge variant="destructive">Fehler</Badge>
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Ausstehend</Badge>
      default:
        return <Badge variant="outline">Unbekannt</Badge>
    }
  }

  const startItem = (currentPage - 1) * itemsPerPage + 1
  const endItem = Math.min(currentPage * itemsPerPage, totalTransactions)

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Transaction Logs</h2>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={cn("w-4 h-4 mr-2", isLoading && "animate-spin")} />
            Aktualisieren
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Nach Transaction ID, User oder Event Typ suchen..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Stats Summary */}
        <div className="text-sm text-muted-foreground">
          {isLoading ? (
            'Lade Transaktionen...'
          ) : (
            `${startItem}-${endItem} von ${totalTransactions} Transaktionen`
          )}
        </div>
      </div>

      {/* Transaction List */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center p-8 text-muted-foreground">
              <p>Keine Transaktionen gefunden</p>
            </div>
          ) : (
            transactions.map((transaction) => (
              <div
                key={`${transaction.transaction_id}-${transaction.event_index}`}
                className={cn(
                  'p-3 rounded-lg border cursor-pointer transition-all duration-150',
                  'hover:bg-muted/50',
                  selectedTransaction?.transaction_id === transaction.transaction_id && 
                  selectedTransaction?.event_index === transaction.event_index
                    ? 'bg-primary/10 border-primary/30'
                    : 'border-border'
                )}
                onClick={() => onTransactionSelect(transaction)}
              >
                {/* Header Row - Transaction ID and Status */}
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(transaction.status)}
                    <span className="text-sm font-mono font-bold text-foreground truncate">
                      {transaction.transaction_id}
                    </span>
                    <span className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded">
                      #{transaction.event_index}
                    </span>
                  </div>
                  {getStatusBadge(transaction.status)}
                </div>

                {/* Event Type Row */}
                <div className="mb-1">
                  <div className="text-sm font-medium text-foreground truncate">
                    {transaction.event_type || 'Unbekannter Event'}
                  </div>
                </div>

                {/* Amount and Merchant Row */}
                <div className="flex items-center justify-between mb-1">
                  <div className="text-sm font-medium text-foreground">
                    {formatAmount(transaction.total_amount, transaction.currency)}
                  </div>
                  <div className="text-xs text-muted-foreground truncate max-w-[120px]">
                    {transaction.merchant_name || 'Unbekannter Merchant'}
                  </div>
                </div>

                {/* Timestamp Row */}
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{formatTimestamp(transaction.time)}</span>
                  <span>{transaction.device_type || 'N/A'}</span>
                </div>

                {/* Error message for failed transactions */}
                {transaction.status === 'failed' && (
                  <div className="text-xs text-red-600 truncate mt-2 p-2 bg-red-50 rounded">
                    {transaction.event_failure_message || transaction.checkout_session_abort_reason || 'Unbekannter Fehler'}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Pagination Footer */}
      <div className="border-t p-3">
        <div className="flex items-center justify-between text-sm">
          <div className="text-muted-foreground">
            {currentPage} von {totalPages}
          </div>
          
          <div className="flex items-center space-x-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage <= 1 || isLoading}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            
            {/* Show only 3 page numbers for compact view */}
            {totalPages > 1 && (
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage === 1) {
                    pageNum = i + 1;
                  } else if (currentPage === totalPages) {
                    pageNum = totalPages - 2 + i;
                  } else {
                    pageNum = currentPage - 1 + i;
                  }
                  
                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => onPageChange(pageNum)}
                      disabled={isLoading}
                      className="h-8 w-8 p-0 text-xs"
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>
            )}
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages || isLoading}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
} 