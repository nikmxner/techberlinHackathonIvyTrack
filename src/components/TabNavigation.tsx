'use client'

import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { 
  BarChart3, 
  Receipt, 
  TrendingUp,
  LogOut
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
    description: 'Transaction Monitoring und Fehlerbehebung'
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

  const handleLogout = () => {
    router.push('/login')
  }

  return (
    <div className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center justify-between px-4">
        <div className="flex items-center space-x-6">
          {/* Tab Navigation */}
          <nav className="flex items-center space-x-1">
            {tabs.map((tab) => (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? 'default' : 'ghost'}
                size="sm"
                onClick={() => handleTabChange(tab.href)}
                className="flex items-center space-x-2"
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.label}</span>
                {tab.badge && (
                  <Badge variant={tab.badge.variant} className="ml-1 h-5 text-xs">
                    {tab.badge.text}
                  </Badge>
                )}
              </Button>
            ))}
          </nav>
        </div>

        {/* User Avatar - positioned at absolute right edge */}
        <div className="flex items-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <span className="text-sm font-medium">MN</span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">meixnernik@gmail.com</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    merchant_008
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Abmelden</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  )
} 