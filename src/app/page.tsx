'use client'

import { TabNavigation } from '@/components/TabNavigation'
import { Dashboard } from '@/components/Dashboard'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <TabNavigation />
      <Dashboard />
    </div>
  )
}
