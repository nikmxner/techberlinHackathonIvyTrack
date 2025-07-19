'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BarChart3, CreditCard, Users, TrendingUp } from 'lucide-react'

export default function TestDashboardPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-white">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold">Test Dashboard</h1>
          </div>
          <Button variant="outline">Test Button</Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Welcome Section */}
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold text-foreground">✅ Dashboard Route funktioniert!</h2>
            <p className="text-lg text-muted-foreground">
              Diese Seite lädt ohne Auth - das Problem liegt am AuthContext, nicht an der Route.
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Transaktionen</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">64,681</div>
                <p className="text-xs text-muted-foreground">merchant_008 + merchant_007</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Benutzer</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1</div>
                <p className="text-xs text-muted-foreground">meixnernik@gmail.com</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Analytics</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">✅</div>
                <p className="text-xs text-muted-foreground">Routes funktionieren</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Status</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">🔧</div>
                <p className="text-xs text-muted-foreground">Auth Context muss gefixt werden</p>
              </CardContent>
            </Card>
          </div>

          {/* Problem Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>🔍 Problem Analysis</CardTitle>
              <CardDescription>
                Der 404 Error kommt vom AuthContext Loading Loop
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-green-600">✅ Was funktioniert:</h4>
                  <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                    <li>• Next.js App Router</li>
                    <li>• Route /test-dashboard</li>
                    <li>• UI Components</li>
                    <li>• Tailwind CSS</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-red-600">❌ Problem:</h4>
                  <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                    <li>• AuthContext Loading Loop</li>
                    <li>• ProtectedRoute redirect conflicts</li>
                    <li>• useAuth() hook timeout</li>
                    <li>• Supabase session handling</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 