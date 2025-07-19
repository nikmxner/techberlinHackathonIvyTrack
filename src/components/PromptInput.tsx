'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Send, 
  Loader2, 
  Sparkles, 
  TrendingUp, 
  PieChart, 
  BarChart3,
  Clock,
  Lightbulb
} from 'lucide-react'

interface PromptInputProps {
  onSubmit: (prompt: string) => Promise<void>
  isLoading?: boolean
  suggestions?: string[]
  placeholder?: string
}

const QUICK_ACTIONS = [
  {
    icon: TrendingUp,
    label: 'Trend-Analyse',
    prompt: 'Zeige mir die Trends der letzten 30 Tage'
  },
  {
    icon: PieChart,
    label: 'Verteilung',
    prompt: 'Erstelle eine Verteilungsanalyse der wichtigsten Kategorien'
  },
  {
    icon: BarChart3,
    label: 'Vergleich',
    prompt: 'Vergleiche die Performance zwischen verschiedenen Bereichen'
  },
  {
    icon: Clock,
    label: 'Zeitraum',
    prompt: 'Analysiere die Entwicklung über die letzten 12 Monate'
  }
]

const EXAMPLE_PROMPTS = [
  'Zeige mir die Umsatzentwicklung der letzten 6 Monate',
  'Welche Produktkategorien haben die höchste Konversionsrate?',
  'Erstelle eine Analyse der Kundensegmente nach Regionen',
  'Wie hat sich die Performance im Vergleich zum Vorjahr entwickelt?',
  'Zeige mir die Top 10 Produkte nach Verkaufszahlen'
]

export function PromptInput({ onSubmit, isLoading = false, suggestions = [], placeholder }: PromptInputProps) {
  const [prompt, setPrompt] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([])
  const [selectedSuggestion, setSelectedSuggestion] = useState(-1)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)

  const characterCount = prompt.length
  const maxCharacters = 1000

  // Filter suggestions based on current input
  useEffect(() => {
    if (prompt.length > 2) {
      const filtered = suggestions.filter(suggestion =>
        suggestion.toLowerCase().includes(prompt.toLowerCase())
      )
      setFilteredSuggestions(filtered)
      setShowSuggestions(filtered.length > 0)
    } else {
      setShowSuggestions(false)
      setFilteredSuggestions([])
    }
    setSelectedSuggestion(-1)
  }, [prompt, suggestions])

  const handleSubmit = async () => {
    if (!prompt.trim() || isLoading) return
    
    try {
      await onSubmit(prompt.trim())
      setPrompt('')
      setShowSuggestions(false)
    } catch (error) {
      console.error('Error submitting prompt:', error)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      handleSubmit()
    } else if (e.key === 'ArrowDown' && showSuggestions) {
      e.preventDefault()
      setSelectedSuggestion(prev => 
        prev < filteredSuggestions.length - 1 ? prev + 1 : prev
      )
    } else if (e.key === 'ArrowUp' && showSuggestions) {
      e.preventDefault()
      setSelectedSuggestion(prev => prev > 0 ? prev - 1 : prev)
    } else if (e.key === 'Enter' && selectedSuggestion >= 0) {
      e.preventDefault()
      setPrompt(filteredSuggestions[selectedSuggestion])
      setShowSuggestions(false)
    } else if (e.key === 'Escape') {
      setShowSuggestions(false)
      setSelectedSuggestion(-1)
    }
  }

  const selectSuggestion = (suggestion: string) => {
    setPrompt(suggestion)
    setShowSuggestions(false)
    textareaRef.current?.focus()
  }

  const selectQuickAction = (actionPrompt: string) => {
    setPrompt(actionPrompt)
    textareaRef.current?.focus()
  }

  const selectExamplePrompt = (examplePrompt: string) => {
    setPrompt(examplePrompt)
    textareaRef.current?.focus()
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      {/* Quick Actions */}
      <div className="flex flex-wrap gap-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Lightbulb className="w-4 h-4" />
          <span>Schnellaktionen:</span>
        </div>
        {QUICK_ACTIONS.map((action, index) => {
          const Icon = action.icon
          return (
            <Button
              key={index}
              variant="outline"
              size="sm"
              className="h-8"
              onClick={() => selectQuickAction(action.prompt)}
              disabled={isLoading}
            >
              <Icon className="w-3 h-3 mr-1" />
              {action.label}
            </Button>
          )
        })}
      </div>

      <Separator />

      {/* Main Input Area */}
      <div className="relative">
        <Card className="p-4">
          <div className="space-y-3">
            <div className="relative">
              <Textarea
                ref={textareaRef}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder || "Beschreiben Sie Ihre Datenanalyse in natürlicher Sprache..."}
                className="min-h-[120px] resize-none pr-16"
                maxLength={maxCharacters}
                disabled={isLoading}
              />
              
              {/* Character Count */}
              <div className="absolute bottom-2 right-2 text-xs text-muted-foreground">
                {characterCount}/{maxCharacters}
              </div>
            </div>

            {/* Suggestions Dropdown */}
            {showSuggestions && (
              <Card 
                ref={suggestionsRef}
                className="absolute z-10 w-full mt-1 max-h-60 overflow-y-auto"
              >
                <div className="p-2">
                  <div className="text-xs text-muted-foreground mb-2 px-2">
                    Vorschläge aus der Historie
                  </div>
                  {filteredSuggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className={`px-2 py-2 rounded cursor-pointer text-sm transition-colors ${
                        index === selectedSuggestion
                          ? 'bg-muted'
                          : 'hover:bg-muted/50'
                      }`}
                      onClick={() => selectSuggestion(suggestion)}
                    >
                      {suggestion}
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Bottom Bar */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Sparkles className="w-3 h-3" />
                <span>Strg+Enter zum Senden</span>
              </div>
              
              <Button 
                onClick={handleSubmit}
                disabled={!prompt.trim() || isLoading}
                size="sm"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Verarbeite...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Analysieren
                  </>
                )}
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Example Prompts */}
      {prompt.length === 0 && (
        <div className="space-y-2">
          <div className="text-sm text-muted-foreground">Beispiel-Anfragen:</div>
          <div className="flex flex-wrap gap-2">
            {EXAMPLE_PROMPTS.map((example, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="cursor-pointer hover:bg-secondary/80 transition-colors"
                onClick={() => selectExamplePrompt(example)}
              >
                {example}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  )
} 