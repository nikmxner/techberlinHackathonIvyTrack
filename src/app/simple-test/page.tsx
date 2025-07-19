'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

export default function SimpleTestPage() {
  const { user, loading, isAuthenticated, userMerchants, currentMerchant, signOut } = useAuth()
  const [testData, setTestData] = useState<any>(null)

  const handleSignOut = async () => {
    await signOut()
    window.location.href = '/login'
  }

  const testSupabaseConnection = async () => {
    try {
      const response = await fetch('/api/transactions?limit=1')
      const data = await response.json()
      setTestData(data)
    } catch (error) {
      setTestData({ error: String(error) })
    }
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>🔧 Simple Auth Test</CardTitle>
            <CardDescription>
              Minimaler Auth Status Test ohne komplexe Redirects
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Loading:</label>
                <Badge variant={loading ? "destructive" : "default"}>
                  {loading ? "TRUE" : "FALSE"}
                </Badge>
              </div>
              
              <div>
                <label className="text-sm font-medium">Authenticated:</label>
                <Badge variant={isAuthenticated ? "default" : "destructive"}>
                  {isAuthenticated ? "TRUE" : "FALSE"}
                </Badge>
              </div>

              <div>
                <label className="text-sm font-medium">User Email:</label>
                <p className="text-sm font-mono">{user?.email || 'None'}</p>
              </div>

              <div>
                <label className="text-sm font-medium">User ID:</label>
                <p className="text-xs font-mono">{user?.id || 'None'}</p>
              </div>

              <div>
                <label className="text-sm font-medium">Merchants Count:</label>
                <Badge>{userMerchants.length}</Badge>
              </div>

              <div>
                <label className="text-sm font-medium">Current Merchant:</label>
                <p className="text-sm">{currentMerchant?.name || 'None'}</p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={testSupabaseConnection}>
                Test API Connection
              </Button>
              
              <Button asChild variant="outline">
                <Link href="/login">Go to Login</Link>
              </Button>

              <Button asChild variant="outline">
                <Link href="/dashboard">Go to Dashboard</Link>
              </Button>

              {isAuthenticated && (
                <Button onClick={handleSignOut} variant="destructive">
                  Sign Out
                </Button>
              )}
            </div>

            {testData && (
              <div className="mt-4 p-4 bg-muted rounded">
                <h4 className="font-medium mb-2">API Test Result:</h4>
                <pre className="text-xs overflow-auto">
                  {JSON.stringify(testData, null, 2)}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 