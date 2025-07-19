'use client'

import { Transaction } from '@/types/transactions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  CheckCircle, 
  Clock, 
  DollarSign, 
  User, 
  CreditCard, 
  Globe,
  Server,
  Zap,
  Monitor,
  Smartphone,
  Tablet,
  Euro,
  PoundSterling,
  Circle
} from 'lucide-react'

interface SuccessDetailsProps {
  transaction: Transaction
  onTransactionUpdate: (transaction: Transaction) => void
}

export function SuccessDetails({ transaction }: SuccessDetailsProps) {
  const formatTimestamp = (timestamp: Date | string | null) => {
    if (!timestamp) return 'N/A'
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

  const getCurrencyIcon = (currency: string | null) => {
    switch (currency) {
      case 'EUR':
        return <Euro className="w-4 h-4 text-muted-foreground" />
      case 'USD':
        return <DollarSign className="w-4 h-4 text-muted-foreground" />
      case 'GBP':
        return <PoundSterling className="w-4 h-4 text-muted-foreground" />
      case 'CHF':
        return <Circle className="w-4 h-4 text-muted-foreground" />
      case 'SEK':
      case 'NOK':
      case 'DKK':
        return <Circle className="w-4 h-4 text-muted-foreground" />
      case 'JPY':
        return <Circle className="w-4 h-4 text-muted-foreground" />
      default:
        return <DollarSign className="w-4 h-4 text-muted-foreground" />
    }
  }

  const getDeviceIcon = (deviceType: string | null) => {
    switch (deviceType) {
      case 'desktop':
        return <Monitor className="w-4 h-4" />
      case 'mobile':
        return <Smartphone className="w-4 h-4" />
      case 'tablet':
        return <Tablet className="w-4 h-4" />
      default:
        return <Monitor className="w-4 h-4" />
    }
  }

  const getDeviceLabel = (deviceType: string | null) => {
    switch (deviceType) {
      case 'desktop':
        return 'Desktop'
      case 'mobile':
        return 'Mobil'
      case 'tablet':
        return 'Tablet'
      default:
        return deviceType || 'Unbekannt'
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <CheckCircle className="w-6 h-6 text-green-500" />
        <div>
          <h1 className="text-xl font-semibold text-green-700">Event erfolgreich</h1>
          <p className="text-sm text-muted-foreground">
            ID: {transaction.transaction_id} • Event #{transaction.event_index}
          </p>
        </div>
      </div>

      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Event Details</CardTitle>
          <CardDescription>Informationen zu diesem Payment Event</CardDescription>
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
                <span className="text-sm">{formatTimestamp(transaction.time)}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Event Typ
              </div>
              <div className="mt-1">
                <span className="text-sm font-medium">{transaction.event_type || 'Unbekannt'}</span>
              </div>
            </div>

            {transaction.total_amount && (
              <div>
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Betrag
                </div>
                <div className="flex items-center gap-2 mt-1">
                  {getCurrencyIcon(transaction.currency)}
                  <span className="text-lg font-semibold">
                    {transaction.total_amount.toFixed(2)} {transaction.currency || ''}
                  </span>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Merchant Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Merchant Details</CardTitle>
          <CardDescription>Informationen zum Händler</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Merchant Name
              </div>
              <div className="mt-1">
                <span className="text-sm font-medium">{transaction.merchant_name || 'Unbekannt'}</span>
              </div>
            </div>
            
            <div>
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Merchant ID
              </div>
              <div className="mt-1">
                <span className="text-sm font-mono">{transaction.merchant_id || 'N/A'}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Kategorie
              </div>
              <div className="mt-1">
                <Badge variant="secondary">{transaction.merchant_category || 'Unbekannt'}</Badge>
              </div>
            </div>

            <div>
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Markt
              </div>
              <div className="mt-1">
                <span className="text-sm">{transaction.merchant_requested_market || 'N/A'}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Session Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Session Details</CardTitle>
          <CardDescription>Technische Session-Informationen</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                User ID
              </div>
              <div className="mt-1">
                <span className="text-sm font-mono">{transaction.user_id || 'N/A'}</span>
              </div>
            </div>
            
            <div>
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Device
              </div>
              <div className="flex items-center gap-2 mt-1">
                {getDeviceIcon(transaction.device_type)}
                <span className="text-sm">{getDeviceLabel(transaction.device_type)}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Browser
              </div>
              <div className="mt-1">
                <span className="text-sm">{transaction.browser || 'N/A'}</span>
              </div>
            </div>

            <div>
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Sprache
              </div>
              <div className="mt-1">
                <span className="text-sm">{transaction.language || 'N/A'}</span>
              </div>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Session Start
              </div>
              <div className="mt-1">
                <span className="text-sm">{formatTimestamp(transaction.session_start_time)}</span>
              </div>
            </div>

            <div>
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                User Location
              </div>
              <div className="mt-1">
                <span className="text-sm">{transaction.user_location || 'N/A'}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Reference */}
      {transaction.pis_payment_reference && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Payment Referenz</CardTitle>
            <CardDescription>Zahlungs-Referenznummer</CardDescription>
          </CardHeader>
          <CardContent>
            <div>
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                PIS Referenz
              </div>
              <div className="mt-1">
                <span className="text-sm font-mono bg-muted px-2 py-1 rounded">
                  {transaction.pis_payment_reference}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Session Flags */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Session Eigenschaften</CardTitle>
          <CardDescription>Verschiedene Session-Flags</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {transaction.is_guest_mode && (
              <Badge variant="outline">Gast-Modus</Badge>
            )}
            {transaction.is_returning_user && (
              <Badge variant="outline">Wiederkehrender User</Badge>
            )}
            {transaction.is_express && (
              <Badge variant="outline">Express Payment</Badge>
            )}
            {transaction.token_present && (
              <Badge variant="outline">Token vorhanden</Badge>
            )}
            {transaction.token_version && (
              <Badge variant="outline">Token {transaction.token_version}</Badge>
            )}
            {!transaction.is_guest_mode && !transaction.is_returning_user && !transaction.is_express && !transaction.token_present && (
              <span className="text-sm text-muted-foreground">Keine besonderen Eigenschaften</span>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 