'use client'

import Link from 'next/link'
import { Shield, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'

export default function NoAccessPage() {
  const { user, signOut } = useAuth()

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <Shield className="mx-auto h-16 w-16 text-muted-foreground" />
          <h2 className="mt-6 text-3xl font-bold tracking-tight">
            Kein Zugriff gewährt
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Sie haben derzeit keinen Zugriff auf Merchant-Daten. 
            Bitte wenden Sie sich an Ihren Administrator, um Zugriff zu erhalten.
          </p>
        </div>
        
        <div className="space-y-4">
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm font-medium">Angemeldeter Benutzer:</p>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>
          
          <Button onClick={handleSignOut} variant="outline" className="w-full">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Abmelden
          </Button>
          
          <p className="text-xs text-muted-foreground">
            Benötigen Sie Hilfe? Kontaktieren Sie Ihren Systemadministrator.
          </p>
        </div>
      </div>
    </div>
  )
} 