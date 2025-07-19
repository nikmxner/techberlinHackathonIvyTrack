'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function AuthCodeError() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  const getErrorMessage = (errorCode: string | null) => {
    switch (errorCode) {
      case 'no_code':
        return 'Kein Authentifizierungs-Code erhalten. Der Magic Link ist möglicherweise ungültig.'
      case 'Internal server error':
        return 'Interner Server-Fehler bei der Authentifizierung.'
      default:
        return error || 'Der Authentifizierungs-Link ist möglicherweise abgelaufen oder bereits verwendet worden.'
    }
  }

  const getSolution = (errorCode: string | null) => {
    switch (errorCode) {
      case 'no_code':
        return 'Stellen Sie sicher, dass Sie den kompletten Link aus der E-Mail kopiert haben.'
      case 'Internal server error':
        return 'Versuchen Sie es in einigen Minuten erneut.'
      default:
        return 'Fordern Sie einen neuen Magic Link an.'
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-destructive mb-4" />
          <CardTitle>Authentifizierungs-Fehler</CardTitle>
          <CardDescription>
            {getErrorMessage(error)}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm">
              <strong>Lösung:</strong> {getSolution(error)}
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 rounded-lg border border-red-200">
              <p className="text-xs text-red-800">
                <strong>Fehler-Details:</strong> {error}
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Button asChild className="w-full">
              <Link href="/login">
                <RefreshCw className="mr-2 h-4 w-4" />
                Neuen Magic Link anfordern
              </Link>
            </Button>
            
            <p className="text-xs text-center text-muted-foreground">
              Falls das Problem weiterhin besteht, kontaktieren Sie den Support.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 