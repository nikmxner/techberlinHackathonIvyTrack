import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    try {
      const supabase = await createClient()
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (!error) {
        // Always redirect to test page to verify auth works
        return NextResponse.redirect(`${origin}/simple-test`)
      }
    } catch (error) {
      console.error('Auth callback error:', error)
    }
  }

  // Redirect to login on any error
  return NextResponse.redirect(`${origin}/login`)
} 