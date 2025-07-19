'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Star,
  MoreHorizontal,
  Trash2,
  Edit,
  Copy,
  ExternalLink,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock
} from 'lucide-react'
import { PromptHistoryItem } from '@/types'

interface HistoryItemProps {
  item: PromptHistoryItem
  onSelect: () => void
  onDelete: () => void
  onToggleFavorite: () => void
}

export function HistoryItem({ item, onSelect, onDelete, onToggleFavorite }: HistoryItemProps) {
  const [isHovered, setIsHovered] = useState(false)

  const getStatusIcon = () => {
    switch (item.status) {
      case 'success':
        return <CheckCircle className="w-3 h-3 text-green-500" />
      case 'error':
        return <XCircle className="w-3 h-3 text-red-500" />
      case 'pending':
        return <AlertCircle className="w-3 h-3 text-yellow-500" />
      default:
        return <Clock className="w-3 h-3 text-muted-foreground" />
    }
  }

  const getStatusLabel = () => {
    switch (item.status) {
      case 'success':
        return 'Erfolgreich'
      case 'error':
        return 'Fehler'
      case 'pending':
        return 'Ausstehend'
      default:
        return 'Unbekannt'
    }
  }

  const formatTimestamp = (timestamp: Date | string) => {
    const now = new Date()
    const date = timestamp instanceof Date ? timestamp : new Date(timestamp)
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Gerade eben'
    if (minutes < 60) return `vor ${minutes}m`
    if (hours < 24) return `vor ${hours}h`
    if (days < 7) return `vor ${days}d`
    
    return new Intl.DateTimeFormat('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit'
    }).format(date)
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch (err) {
      console.error('Failed to copy text:', err)
    }
  }

  const truncatePrompt = (prompt: string, maxLength: number = 80) => {
    if (prompt.length <= maxLength) return prompt
    return prompt.substring(0, maxLength) + '...'
  }

  return (
    <Card
      className={`p-3 cursor-pointer transition-all duration-200 hover:shadow-md ${
        isHovered ? 'ring-1 ring-primary/20' : ''
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onSelect}
    >
      <div className="space-y-2">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            {getStatusIcon()}
            <span className="text-xs text-muted-foreground">
              {formatTimestamp(item.timestamp)}
            </span>
            {item.executionTime && (
              <Badge variant="outline" className="h-4 text-xs">
                {item.executionTime}ms
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className={`w-6 h-6 ${item.isFavorite ? 'text-yellow-500' : 'text-muted-foreground'}`}
              onClick={(e) => {
                e.stopPropagation()
                onToggleFavorite()
              }}
            >
              <Star className={`w-3 h-3 ${item.isFavorite ? 'fill-current' : ''}`} />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-6 h-6 text-muted-foreground"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal className="w-3 h-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => copyToClipboard(item.prompt)}>
                  <Copy className="w-4 h-4 mr-2" />
                  Prompt kopieren
                </DropdownMenuItem>
                {item.sqlQuery && (
                  <DropdownMenuItem onClick={() => copyToClipboard(item.sqlQuery!)}>
                    <Copy className="w-4 h-4 mr-2" />
                    SQL kopieren
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={onSelect}>
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Öffnen
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onToggleFavorite}>
                  <Star className="w-4 h-4 mr-2" />
                  {item.isFavorite ? 'Aus Favoriten entfernen' : 'Zu Favoriten hinzufügen'}
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={(e) => {
                    e.stopPropagation()
                    onDelete()
                  }}
                  className="text-destructive"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Löschen
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Prompt Text */}
        <div className="text-sm text-foreground leading-relaxed">
          {truncatePrompt(item.prompt)}
        </div>

        {/* Metadata */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <span>{getStatusLabel()}</span>
            {item.resultCount && (
              <span>• {item.resultCount} Ergebnisse</span>
            )}
          </div>
          
          {item.chartTypes && item.chartTypes.length > 0 && (
            <div className="flex gap-1">
              {item.chartTypes.map((type, index) => (
                <Badge key={index} variant="outline" className="h-4 text-xs">
                  {type}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Tags */}
        {item.tags && item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {item.tags.map((tag, index) => (
              <Badge key={index} variant="secondary" className="h-4 text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </Card>
  )
} 