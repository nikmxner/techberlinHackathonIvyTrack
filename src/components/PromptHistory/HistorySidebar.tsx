'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Search,
  Filter,
  Clock,
  Star,
  Trash2,
  Download,
  Upload,
  Settings,
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react'
import { PromptHistoryItem, HistoryFilters } from '@/types'
import { HistoryItem } from './HistoryItem'
import { HistorySearch } from './HistorySearch'

interface HistorySidebarProps {
  history: PromptHistoryItem[]
  categorizedHistory: {
    today: PromptHistoryItem[]
    yesterday: PromptHistoryItem[]
    thisWeek: PromptHistoryItem[]
    older: PromptHistoryItem[]
  }
  filters: HistoryFilters
  onFiltersChange: (filters: HistoryFilters) => void
  onSelectPrompt: (prompt: PromptHistoryItem) => void
  onDeletePrompt: (id: string) => void
  onToggleFavorite: (id: string) => void
  onClearHistory: () => void
  onExportHistory: () => void
  onImportHistory: (file: File) => void
  isLoading?: boolean
  stats: {
    total: number
    favorites: number
    successful: number
    pending: number
    errors: number
  }
}

export function HistorySidebar({
  history,
  categorizedHistory,
  filters,
  onFiltersChange,
  onSelectPrompt,
  onDeletePrompt,
  onToggleFavorite,
  onClearHistory,
  onExportHistory,
  onImportHistory,
  isLoading = false,
  stats
}: HistorySidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [showClearDialog, setShowClearDialog] = useState(false)

  const handleStatusFilter = (status: string, checked: boolean) => {
    const currentStatus = filters.status || []
    const newStatus = checked
      ? [...currentStatus, status as any]
      : currentStatus.filter(s => s !== status)
    
    onFiltersChange({
      ...filters,
      status: newStatus.length > 0 ? newStatus : undefined
    })
  }

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      onImportHistory(file)
    }
    event.target.value = '' // Reset input
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'today':
        return <Clock className="w-4 h-4" />
      case 'yesterday':
        return <Calendar className="w-4 h-4" />
      case 'thisWeek':
        return <Calendar className="w-4 h-4" />
      case 'older':
        return <Calendar className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'today':
        return 'Heute'
      case 'yesterday':
        return 'Gestern'
      case 'thisWeek':
        return 'Diese Woche'
      case 'older':
        return 'Älter'
      default:
        return category
    }
  }

  const renderCategory = (category: string, items: PromptHistoryItem[]) => {
    if (items.length === 0) return null

    return (
      <div key={category} className="space-y-2">
        <div className="flex items-center gap-2 px-2 py-1 text-sm font-medium text-muted-foreground">
          {getCategoryIcon(category)}
          <span>{getCategoryLabel(category)}</span>
          <Badge variant="secondary" className="h-5 text-xs">
            {items.length}
          </Badge>
        </div>
        <div className="space-y-1">
          {items.map(item => (
            <HistoryItem
              key={item.id}
              item={item}
              onSelect={() => onSelectPrompt(item)}
              onDelete={() => onDeletePrompt(item.id)}
              onToggleFavorite={() => onToggleFavorite(item.id)}
            />
          ))}
        </div>
      </div>
    )
  }

  if (isCollapsed) {
    return (
      <div className="w-12 h-full border-r bg-background p-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(false)}
          className="w-8 h-8"
        >
          <Search className="w-4 h-4" />
        </Button>
      </div>
    )
  }

  return (
    <div className="w-80 min-h-[calc(100vh-4rem)] border-r bg-background flex flex-col">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Prompt-Historie</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(true)}
            className="w-8 h-8"
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="text-center p-2 bg-muted rounded">
            <div className="text-lg font-bold">{stats.total}</div>
            <div className="text-xs text-muted-foreground">Gesamt</div>
          </div>
          <div className="text-center p-2 bg-muted rounded">
            <div className="text-lg font-bold">{stats.favorites}</div>
            <div className="text-xs text-muted-foreground">Favoriten</div>
          </div>
        </div>

        {/* Search */}
                 <HistorySearch
           value={filters.search || ''}
           onChange={(search: string) => onFiltersChange({ ...filters, search: search || undefined })}
           placeholder="Historie durchsuchen..."
         />
      </div>

      {/* Filters */}
      <div className="p-4 border-b space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Filter</span>
          <div className="flex gap-1">
            {/* Status Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="w-3 h-3 mr-1" />
                  Status
                  {filters.status && filters.status.length > 0 && (
                    <Badge variant="secondary" className="ml-1 h-4 text-xs">
                      {filters.status.length}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Status auswählen</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem
                  checked={filters.status?.includes('success') || false}
                  onCheckedChange={(checked) => handleStatusFilter('success', checked)}
                >
                  <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                  Erfolgreich
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={filters.status?.includes('error') || false}
                  onCheckedChange={(checked) => handleStatusFilter('error', checked)}
                >
                  <XCircle className="w-4 h-4 mr-2 text-red-500" />
                  Fehler
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={filters.status?.includes('pending') || false}
                  onCheckedChange={(checked) => handleStatusFilter('pending', checked)}
                >
                  <AlertCircle className="w-4 h-4 mr-2 text-yellow-500" />
                  Ausstehend
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Favorites Filter */}
            <Button
              variant={filters.favorites ? "default" : "outline"}
              size="sm"
              onClick={() => onFiltersChange({ 
                ...filters, 
                favorites: filters.favorites ? undefined : true 
              })}
            >
              <Star className="w-3 h-3" />
            </Button>
          </div>
        </div>

        {/* Active Filters */}
        {(filters.search || filters.status?.length || filters.favorites) && (
          <div className="flex flex-wrap gap-1">
            {filters.search && (
              <Badge variant="secondary" className="text-xs">
                Suche: {filters.search}
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-3 h-3 ml-1 p-0"
                  onClick={() => onFiltersChange({ ...filters, search: undefined })}
                >
                  ×
                </Button>
              </Badge>
            )}
            {filters.favorites && (
              <Badge variant="secondary" className="text-xs">
                Nur Favoriten
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-3 h-3 ml-1 p-0"
                  onClick={() => onFiltersChange({ ...filters, favorites: undefined })}
                >
                  ×
                </Button>
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="h-5 text-xs"
              onClick={() => onFiltersChange({})}
            >
              Alle zurücksetzen
            </Button>
          </div>
        )}
      </div>

      {/* History List */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {isLoading ? (
            <div className="text-center text-muted-foreground py-8">
              Lade Historie...
            </div>
          ) : history.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              Keine Einträge gefunden
            </div>
          ) : (
            <>
              {renderCategory('today', categorizedHistory.today)}
              {renderCategory('yesterday', categorizedHistory.yesterday)}
              {renderCategory('thisWeek', categorizedHistory.thisWeek)}
              {renderCategory('older', categorizedHistory.older)}
            </>
          )}
        </div>
      </ScrollArea>

      {/* Footer Actions */}
      <div className="p-4 border-t space-y-2">
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onExportHistory}
            className="flex-1"
          >
            <Download className="w-3 h-3 mr-1" />
            Export
          </Button>
          
          <label className="flex-1">
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              asChild
            >
              <span>
                <Upload className="w-3 h-3 mr-1" />
                Import
              </span>
            </Button>
            <input
              type="file"
              accept=".json"
              onChange={handleFileImport}
              className="hidden"
            />
          </label>
        </div>

        <Dialog open={showClearDialog} onOpenChange={setShowClearDialog}>
          <DialogTrigger asChild>
            <Button
              variant="destructive"
              size="sm"
              className="w-full"
            >
              <Trash2 className="w-3 h-3 mr-1" />
              Alle löschen
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Historie löschen</DialogTitle>
              <DialogDescription>
                Sind Sie sicher, dass Sie die gesamte Prompt-Historie löschen möchten? 
                Diese Aktion kann nicht rückgängig gemacht werden.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowClearDialog(false)}>
                Abbrechen
              </Button>
              <Button 
                variant="destructive" 
                onClick={() => {
                  onClearHistory()
                  setShowClearDialog(false)
                }}
              >
                Löschen
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
} 