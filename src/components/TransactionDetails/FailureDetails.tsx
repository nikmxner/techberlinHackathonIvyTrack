'use client'

import { useState } from 'react'
import { Transaction } from '@/types/transactions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ResolutionGuide } from './ResolutionGuide'
import { 
  XCircle, 
  Clock, 
  Euro, 
  User, 
  CreditCard, 
  Globe,
  Server,
  AlertTriangle,
  RotateCcw,
  ExternalLink,
  CheckCircle,
  Zap
} from 'lucide-react'

interface FailureDetailsProps {
  transaction: Transaction
  onTransactionUpdate: (transaction: Transaction) => void
}

export function FailureDetails({ transaction, onTransactionUpdate }: FailureDetailsProps) {
  const [isRetrying, setIsRetrying] = useState(false)
  const [showResolutionGuide, setShowResolutionGuide] = useState(false)

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
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getCategoryLabel = (category?: string) => {
    switch (category) {
      case 'network':
        return 'Netzwerk-Fehler'
      case 'validation':
        return 'Validierungs-Fehler'
      case 'authentication':
        return 'Authentifizierungs-Fehler'
      case 'database':
        return 'Datenbank-Fehler'
      case 'timeout':
        return 'Timeout-Fehler'
      default:
        return 'Unbekannter Fehler'
    }
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

  const handleRetry = async () => {
    setIsRetrying(true)
    // Simulate retry API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Update transaction with retry count
    const updatedTransaction = {
      ...transaction,
      retryCount: (transaction.retryCount || 0) + 1
    }
    onTransactionUpdate(updatedTransaction)
    setIsRetrying(false)
  }

  const handleMarkResolved = () => {
    const updatedTransaction = {
      ...transaction,
      isResolved: true
    }
    onTransactionUpdate(updatedTransaction)
  }

  const documentationLinks = [
    {
      title: 'Payment API Documentation',
      url: '#',
      type: 'api' as const
    },
    {
      title: 'Error Handling Guide',
      url: '#',
      type: 'guide' as const
    },
    {
      title: 'Troubleshooting Common Issues',
      url: '#',
      type: 'troubleshooting' as const
    },
    {
      title: 'FAQ - Payment Failures',
      url: '#',
      type: 'faq' as const
    }
  ]

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <XCircle className="w-6 h-6 text-red-500" />
          <div>
            <h1 className="text-xl font-semibold text-red-700">Transaktion fehlgeschlagen</h1>
            <p className="text-sm text-muted-foreground">
              ID: {transaction.id}
            </p>
          </div>
        </div>
        
        {transaction.isResolved && (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            <CheckCircle className="w-3 h-3 mr-1" />
            Behoben
          </Badge>
        )}
      </div>

      {/* Error Summary */}
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="text-base text-red-800 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Fehlerdetails
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <div className="text-xs font-medium text-red-700 uppercase tracking-wider">
              Fehlermeldung
            </div>
            <p className="text-sm text-red-800 mt-1 font-medium">
              {transaction.errorMessage}
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-medium text-red-700 uppercase tracking-wider">
                Kategorie
              </div>
              <div className="mt-1">
                <Badge 
                  variant="outline" 
                  className={getCategoryColor(transaction.errorCategory)}
                >
                  {getCategoryLabel(transaction.errorCategory)}
                </Badge>
              </div>
            </div>

            <div>
              <div className="text-xs font-medium text-red-700 uppercase tracking-wider">
                Response Code
              </div>
              <div className="mt-1">
                <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">
                  {transaction.responseCode}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for Details and Resolution */}
      <Tabs defaultValue="details" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="details">Transaktionsdetails</TabsTrigger>
          <TabsTrigger value="resolution">Lösungsanleitung</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-4">
          {/* Transaction Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Transaktionsinformationen</CardTitle>
              <CardDescription>Grundlegende Details zur fehlgeschlagenen Transaktion</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Status
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                      <XCircle className="w-3 h-3 mr-1" />
                      Fehlgeschlagen
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

                {transaction.retryCount !== undefined && (
                  <div>
                    <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Wiederholungsversuche
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <RotateCcw className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{transaction.retryCount}</span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Stack Trace */}
          {transaction.stackTrace && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Stack Trace</CardTitle>
                <CardDescription>Technische Details zum Fehler</CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="text-xs bg-muted p-3 rounded overflow-x-auto whitespace-pre-wrap">
                  {transaction.stackTrace}
                </pre>
              </CardContent>
            </Card>
          )}

          {/* Metadata */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Kontext-Informationen</CardTitle>
              <CardDescription>Zusätzliche Metadaten zur Transaktion</CardDescription>
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

              {transaction.metadata.userAgent && (
                <div>
                  <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    User Agent
                  </div>
                  <div className="mt-1">
                    <code className="text-xs bg-muted px-2 py-1 rounded break-all">
                      {transaction.metadata.userAgent}
                    </code>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Aktionen</CardTitle>
              <CardDescription>Verfügbare Optionen für diese Transaktion</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Button 
                  onClick={handleRetry}
                  disabled={isRetrying}
                  size="sm"
                >
                  {isRetrying ? (
                    <>
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2"></div>
                      Wiederhole...
                    </>
                  ) : (
                    <>
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Wiederholen
                    </>
                  )}
                </Button>

                {!transaction.isResolved && (
                  <Button 
                    onClick={handleMarkResolved}
                    variant="outline"
                    size="sm"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Als behoben markieren
                  </Button>
                )}
              </div>

              <div className="text-xs text-muted-foreground">
                <p>
                  • Wiederholen führt eine neue Verarbeitung mit denselben Parametern durch
                  • Als behoben markieren entfernt diese Transaktion aus der aktiven Fehlerliste
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resolution" className="space-y-4">
          <ResolutionGuide 
            transaction={transaction}
            documentationLinks={documentationLinks}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
} 