'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, Zap } from 'lucide-react'

export default function DevLoginPage() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const router = useRouter()
  const supabase = createClient()

  // Only show in development
  useEffect(() => {
    if (process.env.NODE_ENV === 'production') {
      router.push('/login')
    }
  }, [router])

  const handleDevLogin = async () => {
    setLoading(true)
    setMessage('')
    
    try {
      // Try to create a session for the known user
      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'meixnernik@gmail.com',
        password: 'dev-temp-password' // This will fail, but we'll handle it
      })

      if (error) {
        // Expected - now try to send a magic link with better config
        const { error: otpError } = await supabase.auth.signInWithOtp({
          email: 'meixnernik@gmail.com',
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
            shouldCreateUser: false // Don't create new user
          }
        })

        if (otpError) {
          setMessage(`Magic Link Error: ${otpError.message}`)
        } else {
          setMessage('✅ Magic Link sent successfully! Check email.')
        }
      }
    } catch (error) {
      setMessage(`Error: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  const handleDirectLogin = async () => {
    setLoading(true)
    
    try {
      // Create a session manually (development only)
      const { data, error } = await supabase.auth.admin.generateLink({
        type: 'magiclink',
        email: 'meixnernik@gmail.com',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (error) {
        setMessage(`Direct login error: ${error.message}`)
      } else {
        setMessage('Direct login link generated - check console')
        console.log('Direct login link:', data.properties?.action_link)
      }
    } catch (error) {
      setMessage(`Exception: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  if (process.env.NODE_ENV === 'production') {
    return null
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-500" />
            Development Login
          </CardTitle>
          <CardDescription>
            Debug tools für Authentication (nur Development)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="flex gap-2">
              <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <p className="font-medium">Development Mode</p>
                <p className="text-xs">Diese Seite ist nur in Development verfügbar</p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Button 
              onClick={handleDevLogin}
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Sending...' : 'Send Magic Link (Debug)'}
            </Button>

            <Button 
              onClick={handleDirectLogin}
              disabled={loading}
              variant="outline"
              className="w-full"
            >
              Generate Direct Link
            </Button>

            <Button asChild variant="ghost" className="w-full">
              <a href="/login">← Back to Normal Login</a>
            </Button>
          </div>

          {message && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm font-mono">{message}</p>
            </div>
          )}

          <div className="text-xs text-muted-foreground">
            <p><strong>User:</strong> meixnernik@gmail.com</p>
            <p><strong>Callback:</strong> {window.location.origin}/auth/callback</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 