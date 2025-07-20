'use client'

import { useState } from 'react'
import { Transaction } from '@/types/transactions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  XCircle,
  Clock,
  DollarSign,
  AlertTriangle,
  Loader2,
  Monitor,
  Smartphone,
  Tablet,
  Euro,
  PoundSterling,
  Circle
} from 'lucide-react'

interface FailureDetailsProps {
  transaction: Transaction
  onTransactionUpdate: (transaction: Transaction) => void
}

export function FailureDetails({ transaction }: FailureDetailsProps) {
  // --- New state for AI generation ---
  const [isGenerating, setIsGenerating] = useState(false)
  const [explanation, setExplanation] = useState<string | null>(null)
  const [fixes, setFixes] = useState<string[]>([])

  // --- Helpers from your original file ---
  const formatTimestamp = (timestamp: Date | string | null) => {
    if (!timestamp) return 'N/A'
    const date = timestamp instanceof Date ? timestamp : new Date(timestamp)
    return new Intl.DateTimeFormat('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(date)
  }

  const getCurrencyIcon = (currency: string | null) => {
    switch (currency) {
      case 'EUR': return <Euro className="w-4 h-4 text-muted-foreground" />
      case 'USD': return <DollarSign className="w-4 h-4 text-muted-foreground" />
      case 'GBP': return <PoundSterling className="w-4 h-4 text-muted-foreground" />
      case 'CHF': case 'SEK': case 'NOK': case 'DKK': case 'JPY':
        return <Circle className="w-4 h-4 text-muted-foreground" />
      default: return <DollarSign className="w-4 h-4 text-muted-foreground" />
    }
  }

  const getDeviceIcon = (deviceType: string | null) => {
    switch (deviceType) {
      case 'desktop': return <Monitor className="w-4 h-4" />
      case 'mobile':  return <Smartphone className="w-4 h-4" />
      case 'tablet':  return <Tablet className="w-4 h-4" />
      default:        return <Monitor className="w-4 h-4" />
    }
  }

  const getErrorMessage = () =>
    transaction.event_failure_message ||
    transaction.checkout_session_abort_reason ||
    'Unbekannter Fehler'

  const getErrorCategoryBadge = () => {
    switch (transaction.errorCategory) {
      case 'network':        return <Badge variant="destructive">Netzwerk</Badge>
      case 'validation':     return <Badge variant="destructive">Validierung</Badge>
      case 'authentication': return <Badge variant="destructive">Authentifizierung</Badge>
      case 'payment':        return <Badge variant="destructive">Zahlung</Badge>
      case 'checkout':       return <Badge variant="destructive">Checkout</Badge>
      case 'timeout':        return <Badge variant="destructive">Timeout</Badge>
      default:               return <Badge variant="destructive">Fehler</Badge>
    }
  }

  // --- New handler to call your API route ---
  const handleGenerate = async () => {
    setIsGenerating(true)
    try {
      const res = await fetch('/api/generate-solution', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ errorMessage: getErrorMessage() }),
      })
      const data = await res.json()
      setExplanation(data.explanation)
      setFixes(data.fixes)
    } catch (err) {
      console.error(err)
      setExplanation('Fehler beim Generieren. Bitte später erneut versuchen.')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <XCircle className="w-6 h-6 text-red-500" />
        <div>
          <h1 className="text-xl font-semibold text-red-700">Event fehlgeschlagen</h1>
          <p className="text-sm text-muted-foreground">
            ID: {transaction.transaction_id} • Event #{transaction.event_index}
          </p>
        </div>
      </div>

      {/* Error Info */}
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="text-base text-red-800">Fehlerdetails</CardTitle>
          <CardDescription>Informationen zu dem aufgetretenen Fehler</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Status
              </div>
              <div className="mt-1 flex items-center gap-2">
                <Badge variant="destructive">
                  <XCircle className="w-3 h-3 mr-1" />
                  Fehlgeschlagen
                </Badge>
              </div>
            </div>
            <div>
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Kategorie
              </div>
              <div className="mt-1">{getErrorCategoryBadge()}</div>
            </div>
          </div>

          <div>
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
              Fehlermeldung
            </div>
            <div className="bg-red-100 border border-red-200 rounded p-3">
              <p className="text-sm text-red-800 font-medium">
                {getErrorMessage()}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Event Typ
              </div>
              <div className="mt-1">
                <span className="text-sm font-medium">
                  {transaction.event_type || 'Unbekannt'}
                </span>
              </div>
            </div>
            <div>
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Zeitstempel
              </div>
              <div className="mt-1 flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">{formatTimestamp(transaction.time)}</span>
              </div>
            </div>
          </div>

          {transaction.total_amount != null && (
            <div>
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Betroffener Betrag
              </div>
              <div className="mt-1 flex items-center gap-2">
                {getCurrencyIcon(transaction.currency)}
                <span className="text-lg font-semibold">
                  {transaction.total_amount.toFixed(2)} {transaction.currency}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Merchant Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Merchant Details</CardTitle>
          <CardDescription>Informationen zum betroffenen Händler</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Merchant Name
              </div>
              <div className="mt-1">
                <span className="text-sm font-medium">
                  {transaction.merchant_name || 'Unbekannt'}
                </span>
              </div>
            </div>
            <div>
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Merchant ID
              </div>
              <div className="mt-1">
                <span className="text-sm font-mono">
                  {transaction.merchant_id || 'N/A'}
                </span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Kategorie
              </div>
              <div className="mt-1">
                <Badge variant="secondary">
                  {transaction.merchant_category || 'Unbekannt'}
                </Badge>
              </div>
            </div>
            <div>
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Markt
              </div>
              <div className="mt-1">
                <span className="text-sm">
                  {transaction.merchant_requested_market || 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Session Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Session Details</CardTitle>
          <CardDescription>Technische Informationen zur Session</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                User ID
              </div>
              <div className="mt-1">
                <span className="text-sm font-mono">
                  {transaction.user_id || 'N/A'}
                </span>
              </div>
            </div>
            <div>
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Device
              </div>
              <div className="mt-1 flex items-center gap-2">
                {getDeviceIcon(transaction.device_type)}
                <span className="text-sm">
                  {transaction.device_type || 'Unbekannt'}
                </span>
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
                Session Start
              </div>
              <div className="mt-1">
                <span className="text-sm">
                  {formatTimestamp(transaction.session_start_time)}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Resolution Guide */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Lösungsunterstützung</CardTitle>
          <CardDescription>AI-gestützte Hilfe zur Problemlösung</CardDescription>
        </CardHeader>
        <CardContent>
          {isGenerating ? (
            <div className="text-center p-4 bg-muted/50 rounded">
              <Loader2 className="animate-spin mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Generiere Lösung…</p>
            </div>
          ) : explanation ? (
            <div className="space-y-4">
              <div>
                <h4 className="font-medium">Einfach erklärt</h4>
                <p className="mt-1 text-sm">{explanation}</p>
              </div>
              <div>
                <h4 className="font-medium">Drei Best Practices</h4>
                <ol className="list-decimal list-inside text-sm space-y-1">
                  {fixes.map((f, i) => (
                    <li key={i}>{f}</li>
                  ))}
                </ol>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setExplanation(null)
                  setFixes([])
                }}
              >
                Schließen
              </Button>
            </div>
          ) : (
            <Button className="w-full" variant="outline" onClick={handleGenerate}>
              <AlertTriangle className="w-4 h-4 mr-2" />
              AI Resolution Guide generieren
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}