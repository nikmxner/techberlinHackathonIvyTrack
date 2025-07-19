'use client'

import { Check, ChevronsUpDown, Building } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function MerchantSwitcher() {
  const { userMerchants, currentMerchant, setCurrentMerchant } = useAuth()

  // Don't render if user has only one merchant or no merchants
  if (userMerchants.length <= 1) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className="w-[200px] justify-between"
        >
          <div className="flex items-center">
            <Building className="mr-2 h-4 w-4 shrink-0" />
            <span className="truncate">
              {currentMerchant?.name || 'Händler auswählen'}
            </span>
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[200px] p-0">
        <DropdownMenuLabel className="text-xs font-normal text-muted-foreground px-2 py-1.5">
          Verfügbare Händler
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {userMerchants.map((userMerchant) => (
          <DropdownMenuItem
            key={userMerchant.merchant_id}
            onSelect={() => {
              if (userMerchant.merchant) {
                setCurrentMerchant(userMerchant.merchant)
              }
            }}
            className="cursor-pointer"
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center">
                <Building className="mr-2 h-4 w-4" />
                <div className="flex flex-col">
                  <span className="text-sm">
                    {userMerchant.merchant?.name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {userMerchant.role}
                  </span>
                </div>
              </div>
              <Check
                className={cn(
                  'h-4 w-4',
                  currentMerchant?.id === userMerchant.merchant_id
                    ? 'opacity-100'
                    : 'opacity-0'
                )}
              />
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 