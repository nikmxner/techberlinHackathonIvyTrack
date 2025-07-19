'use client'

import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  BarChart3, 
  Receipt, 
  AlertTriangle,
  TrendingUp
} from 'lucide-react'

interface TabItem {
  id: string
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  description: string
  badge?: {
    text: string
    variant: 'default' | 'secondary' | 'destructive' | 'outline'
  }
}

const tabs: TabItem[] = [
  {
    id: 'analytics',
    label: 'Analytics Dashboard',
    href: '/',
    icon: BarChart3,
    description: 'Datenanalyse und Visualisierung',
  },
  {
    id: 'transactions',
    label: 'Transaction Logs',
    href: '/transactions',
    icon: Receipt,
    description: 'Transaction Monitoring und Fehlerbehebung',
    badge: {
      text: '1.6% Fehler',
      variant: 'destructive'
    }
  }
]

export function TabNavigation() {
  const pathname = usePathname()
  const router = useRouter()

  const getActiveTab = () => {
    if (pathname === '/') return 'analytics'
    if (pathname.startsWith('/transactions')) return 'transactions'
    return 'analytics'
  }

  const activeTab = getActiveTab()

  const handleTabChange = (href: string) => {
    router.push(href)
  }

  return (
    <div className="border-b bg-background">
      <div className="flex h-16 items-center px-6">
        <div className="flex items-center space-x-6">
          {/* Logo/Brand */}
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-6 w-6 text-primary" />
            <span className="font-bold text-lg">Analytics Hub</span>
          </div>

          {/* Tab Navigation */}
          <nav className="flex space-x-1" role="tablist">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              
              return (
                <Button
                  key={tab.id}
                  variant={isActive ? 'default' : 'ghost'}
                  size="sm"
                  className={cn(
                    'flex items-center space-x-2 h-10 px-4 py-2',
                    isActive 
                      ? 'bg-primary text-primary-foreground shadow-sm' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted',
                    'transition-all duration-200'
                  )}
                  onClick={() => handleTabChange(tab.href)}
                  role="tab"
                  aria-selected={isActive}
                  aria-controls={`${tab.id}-panel`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="font-medium">{tab.label}</span>
                  {tab.badge && (
                    <Badge 
                      variant={tab.badge.variant} 
                      className="ml-2 h-5 text-xs"
                    >
                      {tab.badge.text}
                    </Badge>
                  )}
                </Button>
              )
            })}
          </nav>
        </div>

        {/* Right side actions */}
        <div className="ml-auto flex items-center space-x-4">
          {/* Active tab info */}
          <div className="hidden md:block text-sm text-muted-foreground">
            {tabs.find(tab => tab.id === activeTab)?.description}
          </div>
          
          {/* Status indicator for failed transactions */}
          {activeTab === 'transactions' && (
            <div className="flex items-center space-x-2 text-sm">
              <div className="flex items-center space-x-1 text-red-600">
                <AlertTriangle className="h-4 w-4" />
                <span className="font-medium">3 aktive Fehler</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tab indicator line */}
      <div className="relative">
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-border" />
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id
          if (!isActive) return null
          
          return (
            <div
              key={tab.id}
              className="absolute bottom-0 h-[2px] bg-primary transition-all duration-300"
              style={{
                left: '24px', // Adjust based on your layout
                width: '200px', // Adjust based on tab width
              }}
            />
          )
        })}
      </div>
    </div>
  )
} 