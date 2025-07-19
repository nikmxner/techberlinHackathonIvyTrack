'use client'

import { Transaction } from '@/types/transactions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  CheckCircle, 
  Clock, 
  Euro, 
  User, 
  CreditCard, 
  Globe,
  Server,
  Zap
} from 'lucide-react'

interface SuccessDetailsProps {
  transaction: Transaction
  onTransactionUpdate: (transaction: Transaction) => void
}

export function SuccessDetails({ transaction }: SuccessDetailsProps) {
  const formatTimestamp = (timestamp: Date | string) => {
    const date = timestamp instanceof Date ? timestamp : new Date(timestamp)
    return new Intl.DateTimeFormat('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(date)
  }

  const formatDuration = (duration?: number) => {
    if (!duration) return 'N/A'
    if (duration < 1000) return `${duration}ms`
    return `${(duration / 1000).toFixed(2)}s`
  }

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'card':
        return <CreditCard className="w-4 h-4" />
      case 'paypal':
        return <Globe className="w-4 h-4" />
      case 'bank_transfer':
        return <Server className="w-4 h-4" />
      default:
        return <CreditCard className="w-4 h-4" />
    }
  }

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case 'card':
        return 'Kreditkarte'
      case 'paypal':
        return 'PayPal'
      case 'bank_transfer':
        return 'Banküberweisung'
      default:
        return method
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <CheckCircle className="w-6 h-6 text-green-500" />
        <div>
          <h1 className="text-xl font-semibold text-green-700">Transaktion erfolgreich</h1>
          <p className="text-sm text-muted-foreground">
            ID: {transaction.id}
          </p>
        </div>
      </div>

      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Transaktionsdetails</CardTitle>
          <CardDescription>Grundlegende Informationen zur Transaktion</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Status
              </div>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Erfolgreich
                </Badge>
              </div>
            </div>
            
            <div>
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Zeitstempel
              </div>
              <div className="flex items-center gap-2 mt-1">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">{formatTimestamp(transaction.timestamp)}</span>
              </div>
            </div>
          </div>

          {transaction.amount && (
            <div>
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Betrag
              </div>
              <div className="flex items-center gap-2 mt-1">
                <Euro className="w-4 h-4 text-muted-foreground" />
                <span className="text-lg font-semibold">
                  {transaction.amount.toFixed(2)} {transaction.currency}
                </span>
              </div>
            </div>
          )}

          <Separator />

          <div className="grid grid-cols-2 gap-4">
            {transaction.duration && (
              <div>
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Verarbeitungszeit
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <Zap className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{formatDuration(transaction.duration)}</span>
                </div>
              </div>
            )}

            {transaction.responseCode && (
              <div>
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Response Code
                </div>
                <div className="mt-1">
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    {transaction.responseCode}
                  </Badge>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Metadata */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Zusätzliche Informationen</CardTitle>
          <CardDescription>Metadaten und Kontext zur Transaktion</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {transaction.metadata.userId && (
            <div>
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Benutzer
              </div>
              <div className="flex items-center gap-2 mt-1">
                <User className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-mono">{transaction.metadata.userId}</span>
              </div>
            </div>
          )}

          {transaction.metadata.paymentMethod && (
            <div>
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Zahlungsmethode
              </div>
              <div className="flex items-center gap-2 mt-1">
                {getPaymentMethodIcon(transaction.metadata.paymentMethod)}
                <span className="text-sm">{getPaymentMethodLabel(transaction.metadata.paymentMethod)}</span>
              </div>
            </div>
          )}

          {transaction.metadata.merchantId && (
            <div>
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Händler
              </div>
              <div className="flex items-center gap-2 mt-1">
                <Server className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-mono">{transaction.metadata.merchantId}</span>
              </div>
            </div>
          )}

          {transaction.endpoint && (
            <div>
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                API Endpoint
              </div>
              <div className="mt-1">
                <code className="text-xs bg-muted px-2 py-1 rounded">
                  {transaction.endpoint}
                </code>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Success Summary */}
      <Card className="bg-green-50 border-green-200">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <div>
              <p className="font-medium text-green-800">Transaktion erfolgreich abgeschlossen</p>
              <p className="text-sm text-green-700">
                Alle Validierungen bestanden, Zahlung verarbeitet und bestätigt.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 