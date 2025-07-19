'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, Database } from 'lucide-react'

export default function ManualLoginPage() {
  const [userId, setUserId] = useState('b02665dc-9b8b-40a0-b30e-cb163a3d8cf7')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const handleManualLogin = async () => {
    setLoading(true)
    setMessage('')
    
    try {
      // This is a hack for development - DON'T use in production
      // We'll manually set the session by using the user ID
      
      // First, let's try to get the user data
      const { data: userData, error: userError } = await supabase
        .from('user_merchants')
        .select(`
          user_id,
          role,
          merchant:merchants(*)
        `)
        .eq('user_id', userId)
        .limit(1)
        .single()

      if (userError) {
        setMessage(`User nicht gefunden: ${userError.message}`)
        return
      }

      // Try to create a session token manually
      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'meixnernik@gmail.com',
        password: 'any-password' // This will fail but we'll handle it
      })

      // Show the debug information
      setMessage(`
        User Data gefunden:
        - User ID: ${userData.user_id}
        - Role: ${userData.role}
                 - Merchant: ${Array.isArray(userData.merchant) ? userData.merchant[0]?.name : userData.merchant?.name}
        
        MANUAL STEPS:
        1. Öffnen Sie die Browser DevTools (F12)
        2. Gehen Sie zu Application -> Local Storage
        3. Löschen Sie alle sb-* keys
        4. Versuchen Sie erneut Magic Link
        
        Oder öffnen Sie einen Incognito/Private Browser Tab.
      `)

    } catch (error) {
      setMessage(`Error: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  const clearLocalStorage = () => {
    // Clear all Supabase tokens
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('sb-')) {
        localStorage.removeItem(key)
      }
    })
    
    // Clear session storage too
    Object.keys(sessionStorage).forEach(key => {
      if (key.startsWith('sb-')) {
        sessionStorage.removeItem(key)
      }
    })
    
    setMessage('✅ Local Storage cleared! Try login again.')
    
    // Redirect to login after 2 seconds
    setTimeout(() => {
      router.push('/login')
    }, 2000)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5 text-blue-500" />
            Manual Login Debug
          </CardTitle>
          <CardDescription>
            Manuelle Authentication Debugging Tools
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-3 bg-red-50 rounded-lg border border-red-200">
            <div className="flex gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5" />
              <div className="text-sm text-red-800">
                <p className="font-medium">Development Only</p>
                <p className="text-xs">Diese Tools sind nur für Debugging gedacht</p>
              </div>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">User ID</label>
            <Input
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="font-mono text-xs"
            />
          </div>

          <div className="space-y-2">
            <Button 
              onClick={handleManualLogin}
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Checking...' : 'Check User Data'}
            </Button>

            <Button 
              onClick={clearLocalStorage}
              variant="outline"
              className="w-full"
            >
              Clear Browser Storage
            </Button>

            <Button asChild variant="ghost" className="w-full">
              <a href="/login">← Back to Login</a>
            </Button>

            <Button asChild variant="ghost" className="w-full">
              <a href="/dev-login">Dev Login Tools</a>
            </Button>
          </div>

          {message && (
            <div className="p-3 bg-muted rounded-lg">
              <pre className="text-xs whitespace-pre-wrap">{message}</pre>
            </div>
          )}

          <div className="text-xs text-muted-foreground">
            <p><strong>Known User:</strong> meixnernik@gmail.com</p>
            <p><strong>Known ID:</strong> b02665dc-9b8b-40a0-b30e-cb163a3d8cf7</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 