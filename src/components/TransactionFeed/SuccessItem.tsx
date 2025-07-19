'use client'

import { Transaction } from '@/types/transactions'
import { CheckCircle, Clock, DollarSign, Euro, PoundSterling, Circle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SuccessItemProps {
  transaction: Transaction
  isSelected: boolean
  onSelect: () => void
}

export function SuccessItem({ transaction, isSelected, onSelect }: SuccessItemProps) {
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
      month: '2-digit'
    }).format(date)
  }

  const getCurrencyIcon = (currency: string | null) => {
    switch (currency) {
      case 'EUR':
        return <Euro className="w-2.5 h-2.5" />
      case 'USD':
        return <DollarSign className="w-2.5 h-2.5" />
      case 'GBP':
        return <PoundSterling className="w-2.5 h-2.5" />
      case 'CHF':
        return <Circle className="w-2.5 h-2.5" />
      case 'SEK':
      case 'NOK':
      case 'DKK':
        return <Circle className="w-2.5 h-2.5" />
      case 'JPY':
        return <Circle className="w-2.5 h-2.5" />
      default:
        return <DollarSign className="w-2.5 h-2.5" />
    }
  }

  const truncateId = (id: string, maxLength: number = 12) => {
    if (id.length <= maxLength) return id
    return id.substring(0, maxLength) + '...'
  }

  const getStatusIcon = () => {
    switch (transaction.status) {
      case 'success':
        return <CheckCircle className="w-3 h-3 text-green-500" />
      case 'pending':
        return <Clock className="w-3 h-3 text-yellow-500" />
      default:
        return <CheckCircle className="w-3 h-3 text-green-500" />
    }
  }

  return (
    <div
      className={cn(
        'flex items-center justify-between p-2 rounded cursor-pointer transition-all duration-150',
        'hover:bg-muted/50',
        isSelected 
          ? 'bg-primary/10 border border-primary/20' 
          : 'border border-transparent',
        'min-h-[2.5rem]' // Slim height for successful transactions
      )}
      onClick={onSelect}
    >
      {/* Left side - Status and ID */}
      <div className="flex items-center space-x-2 min-w-0 flex-1">
        {getStatusIcon()}
        <div className="min-w-0 flex-1">
          <div className="text-xs font-mono text-muted-foreground truncate">
            {truncateId(transaction.transaction_id)}
          </div>
          <div className="text-xs text-muted-foreground truncate">
            {transaction.merchant_name || 'Unknown Merchant'}
          </div>
          {transaction.total_amount && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              {getCurrencyIcon(transaction.currency)}
              <span>{transaction.total_amount.toFixed(2)} {transaction.currency || ''}</span>
            </div>
          )}
        </div>
      </div>

      {/* Right side - Timestamp */}
      <div className="text-xs text-muted-foreground">
        {transaction.time ? formatTimestamp(transaction.time) : 'N/A'}
      </div>
    </div>
  )
} 