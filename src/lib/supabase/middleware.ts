import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const supabaseUrl = 'https://hrdpnyfkffoiuesemvdp.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhyZHBueWZrZmZvaXVlc2VtdmRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5MTk2ODcsImV4cCI6MjA2ODQ5NTY4N30.jxWVSopZtQ9HAKBTXHU1cTff38vVINR-s5a0IOflqu4'

export async function updateSession(request: NextRequest) {
  console.log('🔀 Middleware: Processing request:', {
    pathname: request.nextUrl.pathname,
    method: request.method,
    hasAuthCookie: request.cookies.has('sb-access-token')
  })

  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        supabaseResponse = NextResponse.next({
          request,
        })
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        )
      },
    },
  })

  // Refresh session if expired
  const {
    data: { user },
  } = await supabase.auth.getUser()

  console.log('🔍 Middleware: Auth check result:', {
    hasUser: !!user,
    userEmail: user?.email,
    pathname: request.nextUrl.pathname
  })

  // Protect authenticated routes
  const protectedRoutes = ['/transactions', '/dashboard', '/']
  const isProtectedRoute = protectedRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  )

  console.log('🛡️ Middleware: Route protection check:', {
    pathname: request.nextUrl.pathname,
    isProtectedRoute,
    hasUser: !!user
  })

  // Redirect to login if not authenticated on protected routes
  if (isProtectedRoute && !user && request.nextUrl.pathname !== '/login') {
    console.log('🚫 Middleware: Redirecting to login (no user on protected route)')
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Redirect to dashboard if authenticated and trying to access login
  if (user && request.nextUrl.pathname === '/login') {
    console.log('✅ Middleware: Redirecting to dashboard (user accessing login)')
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  console.log('✅ Middleware: Allowing request to proceed')
  return supabaseResponse
} 