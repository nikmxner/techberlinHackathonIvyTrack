'use client'

import { Transaction } from '@/types/transactions'
import { XCircle, AlertTriangle, DollarSign, RotateCcw, CheckCircle, Euro, PoundSterling, Circle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface FailedItemProps {
  transaction: Transaction
  isSelected: boolean
  onSelect: () => void
}

export function FailedItem({ transaction, isSelected, onSelect }: FailedItemProps) {
  const formatTimestamp = (timestamp: Date | string) => {
    const now = new Date()
    const date = timestamp instanceof Date ? timestamp : new Date(timestamp)
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Gerade eben'
    if (minutes < 60) return `${minutes}m`
    if (hours < 24) return `${hours}h`
    if (days < 7) return `${days}d`
    
    return new Intl.DateTimeFormat('de-DE', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  const getCurrencyIcon = (currency: string | null) => {
    switch (currency) {
      case 'EUR':
        return <Euro className="w-3 h-3" />
      case 'USD':
        return <DollarSign className="w-3 h-3" />
      case 'GBP':
        return <PoundSterling className="w-3 h-3" />
      case 'CHF':
        return <Circle className="w-3 h-3" />
      case 'SEK':
      case 'NOK':
      case 'DKK':
        return <Circle className="w-3 h-3" />
      case 'JPY':
        return <Circle className="w-3 h-3" />
      default:
        return <DollarSign className="w-3 h-3" />
    }
  }

  const truncateId = (id: string, maxLength: number = 12) => {
    if (id.length <= maxLength) return id
    return id.substring(0, maxLength) + '...'
  }

  const truncateErrorMessage = (message: string, maxLength: number = 45) => {
    if (message.length <= maxLength) return message
    return message.substring(0, maxLength) + '...'
  }

  const getCategoryColor = (category?: string) => {
    switch (category) {
      case 'network':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'validation':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'authentication':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'database':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'timeout':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'payment':
        return 'bg-pink-100 text-pink-800 border-pink-200'
      case 'checkout':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getCategoryLabel = (category?: string) => {
    switch (category) {
      case 'network':
        return 'Netzwerk'
      case 'validation':
        return 'Validierung'
      case 'authentication':
        return 'Auth'
      case 'database':
        return 'Datenbank'
      case 'timeout':
        return 'Timeout'
      case 'payment':
        return 'Payment'
      case 'checkout':
        return 'Checkout'
      default:
        return 'Unbekannt'
    }
  }

  return (
    <div
      className={cn(
        'p-3 rounded cursor-pointer transition-all duration-150',
        'border-l-4 border-l-red-500',
        'hover:bg-red-50/50',
        isSelected 
          ? 'bg-red-50 border border-red-200 shadow-sm' 
          : 'bg-red-25 border border-red-100',
        'min-h-[4rem]' // Larger height for failed transactions
      )}
      onClick={onSelect}
    >
      {/* Header with status and timestamp */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <XCircle className="w-4 h-4 text-red-500" />
          <span className="text-xs font-mono text-red-700 font-medium">
            {truncateId(transaction.transaction_id)}
          </span>
          {transaction.isResolved && (
            <CheckCircle className="w-3 h-3 text-green-600" />
          )}
        </div>
        <div className="text-xs text-red-600 font-medium">
          {transaction.time ? formatTimestamp(transaction.time) : 'N/A'}
        </div>
      </div>

      {/* Error message preview */}
      <div className="mb-2">
        <p className="text-sm text-red-800 leading-tight">
          {truncateErrorMessage(transaction.event_failure_message || transaction.checkout_session_abort_reason || 'Unbekannter Fehler')}
        </p>
      </div>

      {/* Footer with metadata */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {/* Category badge */}
          {transaction.errorCategory && (
            <Badge 
              variant="outline" 
              className={cn('text-xs h-5', getCategoryColor(transaction.errorCategory))}
            >
              {getCategoryLabel(transaction.errorCategory)}
            </Badge>
          )}
          
          {/* Retry count */}
          {transaction.retryCount && transaction.retryCount > 0 && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <RotateCcw className="w-3 h-3" />
              <span>{transaction.retryCount}</span>
            </div>
          )}
        </div>

        {/* Amount if available */}
        {transaction.total_amount && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            {getCurrencyIcon(transaction.currency)}
            <span>{transaction.total_amount.toFixed(2)} {transaction.currency || ''}</span>
          </div>
        )}
      </div>

      {/* Resolution status indicator */}
      {transaction.isResolved && (
        <div className="mt-2 text-xs text-green-700 bg-green-50 px-2 py-1 rounded border border-green-200">
          ✓ Behoben
        </div>
      )}
    </div>
  )
} 