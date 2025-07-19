'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertCircle, CheckCircle, Mail, Loader2 } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const { signIn } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email) {
      setMessage({ type: 'error', text: 'Bitte geben Sie Ihre E-Mail-Adresse ein.' })
      return
    }

    setLoading(true)
    setMessage(null)

    try {
      console.log('Attempting magic link send to:', email)
      
      const { error } = await signIn(email)
      
      console.log('Magic link result:', { error: error?.message })
      
      if (error) {
        console.error('Magic link error:', error)
        setMessage({ 
          type: 'error', 
          text: `Fehler beim Senden des Magic Links: ${error.message}` 
        })
      } else {
        setMessage({ 
          type: 'success', 
          text: `✅ Magic-Link wurde an ${email} gesendet. Prüfen Sie Ihr E-Mail-Postfach (auch Spam-Ordner).` 
        })
        setEmail('')
      }
    } catch (error) {
      console.error('Unexpected error:', error)
      setMessage({ 
        type: 'error', 
        text: 'Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es erneut.' 
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex items-center justify-center">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Mail className="w-6 h-6 text-primary" />
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-bold tracking-tight">
            Analytics Hub
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Melden Sie sich mit Ihrer E-Mail-Adresse an
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <Label htmlFor="email">E-Mail-Adresse</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="mt-2"
              placeholder="ihre.email@beispiel.de"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>

          {message && (
            <div className={`p-4 rounded-md flex items-start space-x-3 ${
              message.type === 'success' 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-red-50 border border-red-200'
            }`}>
              {message.type === 'success' ? (
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
              )}
              <div className="text-sm">
                <p className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}>
                  {message.text}
                </p>
              </div>
            </div>
          )}

          <Button 
            type="submit" 
            className="w-full"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sende Magic-Link...
              </>
            ) : (
              <>
                <Mail className="mr-2 h-4 w-4" />
                Magic-Link senden
              </>
            )}
          </Button>

          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              Sie erhalten einen Link per E-Mail, mit dem Sie sich anmelden können.
              <br />
              Keine Registrierung erforderlich.
            </p>
          </div>
        </form>
      </div>
    </div>
  )
} 