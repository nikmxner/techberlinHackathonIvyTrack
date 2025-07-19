'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { UserPlus, Building, AlertCircle, CheckCircle } from 'lucide-react'

interface Merchant {
  id: string
  name: string
  category: string | null
}

export default function SetupPage() {
  const { user, userMerchants, refreshUserMerchants } = useAuth()
  const [merchants, setMerchants] = useState<Merchant[]>([])
  const [selectedMerchantId, setSelectedMerchantId] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [success, setSuccess] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    const loadMerchants = async () => {
      try {
        const { data, error } = await supabase
          .from('merchants')
          .select('id, name, category')
          .eq('status', 'active')
          .order('name')

        if (error) {
          console.error('Error loading merchants:', error)
        } else {
          setMerchants(data || [])
        }
      } catch (error) {
        console.error('Error loading merchants:', error)
      } finally {
        setLoading(false)
      }
    }

    loadMerchants()
  }, [])

  const createSelfAssignment = async () => {
    if (!user || !selectedMerchantId) return

    try {
      setCreating(true)

      // Create admin assignment for current user
      const { error } = await supabase
        .from('user_merchants')
        .insert({
          user_id: user.id,
          merchant_id: selectedMerchantId,
          role: 'admin'
        })

      if (error) {
        // Check if user already has access
        if (error.code === '23505') { // Unique constraint violation
          alert('Sie haben bereits Zugriff auf diesen Merchant!')
        } else {
          alert('Fehler beim Erstellen der Zuordnung: ' + error.message)
        }
      } else {
        setSuccess(true)
        // Refresh user merchants in auth context
        await refreshUserMerchants()
        
        // Redirect to dashboard after 2 seconds
        setTimeout(() => {
          window.location.href = '/dashboard'
        }, 2000)
      }
    } catch (error) {
      alert('Unerwarteter Fehler: ' + error)
    } finally {
      setCreating(false)
    }
  }

  // If user already has merchants, redirect to dashboard
  if (userMerchants.length > 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <CardTitle>Setup bereits abgeschlossen</CardTitle>
            <CardDescription>
              Sie haben bereits Zugriff auf Merchant-Daten.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <a href="/dashboard">Zum Dashboard</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <CardTitle>Setup erfolgreich!</CardTitle>
            <CardDescription>
              Sie wurden als Admin für den ausgewählten Merchant eingerichtet.
              Weiterleitung zum Dashboard...
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <UserPlus className="w-16 h-16 text-primary mx-auto mb-4" />
          <h1 className="text-3xl font-bold">Erstes Setup</h1>
          <p className="text-muted-foreground mt-2">
            Gewähren Sie sich selbst Admin-Zugriff auf einen Merchant
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="w-5 h-5" />
              Merchant auswählen
            </CardTitle>
            <CardDescription>
              Wählen Sie den Merchant aus, für den Sie Admin-Zugriff benötigen
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <div className="text-center py-4">
                Lade Merchants...
              </div>
            ) : merchants.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                <AlertCircle className="w-8 h-8 mx-auto mb-2" />
                Keine aktiven Merchants gefunden
              </div>
            ) : (
              <>
                <div>
                  <label className="text-sm font-medium">Merchant</label>
                  <Select value={selectedMerchantId} onValueChange={setSelectedMerchantId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Merchant wählen" />
                    </SelectTrigger>
                    <SelectContent>
                      {merchants.map(merchant => (
                        <SelectItem key={merchant.id} value={merchant.id}>
                          <div>
                            <div>{merchant.name}</div>
                            {merchant.category && (
                              <div className="text-xs text-muted-foreground">{merchant.category}</div>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex gap-2">
                    <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5" />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium">Admin-Rolle</p>
                      <p className="text-xs">Sie erhalten Admin-Rechte für den gewählten Merchant</p>
                    </div>
                  </div>
                </div>

                <Button 
                  onClick={createSelfAssignment}
                  disabled={!selectedMerchantId || creating}
                  className="w-full"
                >
                  {creating ? 'Erstelle Admin-Zugriff...' : 'Admin-Zugriff erstellen'}
                </Button>
              </>
            )}

            <div className="text-center">
              <p className="text-xs text-muted-foreground">
                Angemeldeter User: <span className="font-mono">{user?.email}</span>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 