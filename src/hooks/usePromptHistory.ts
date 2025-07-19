import { useState, useEffect, useCallback } from 'react'
import { useLocalStorage } from './useLocalStorage'
import { PromptHistoryItem, HistoryFilters, LocalStorageHistory } from '@/types'

const STORAGE_KEY = 'analytics-dashboard-history'
const SYNC_INTERVAL = 5000 // 5 seconds

export function usePromptHistory() {
  const [localHistory, setLocalHistory] = useLocalStorage<LocalStorageHistory>(STORAGE_KEY, {
    items: [],
    lastSync: new Date(),
  })
  
  const [history, setHistory] = useState<PromptHistoryItem[]>(localHistory.items)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<HistoryFilters>({})

  // Add new prompt to history
  const addPrompt = useCallback(async (prompt: Omit<PromptHistoryItem, 'id' | 'timestamp' | 'createdAt' | 'updatedAt'>) => {
    const newItem: PromptHistoryItem = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      ...prompt,
    }

    // Add to local state immediately
    const updatedItems = [newItem, ...history]
    setHistory(updatedItems)
    setLocalHistory({
      items: updatedItems,
      lastSync: new Date(),
    })

    // Sync to database
    try {
      const response = await fetch('/api/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem),
      })
      
      if (!response.ok) {
        throw new Error('Failed to save to database')
      }
    } catch (err) {
      console.warn('Failed to sync to database:', err)
    }

    return newItem
  }, [history, setLocalHistory])

  // Update existing prompt
  const updatePrompt = useCallback(async (id: string, updates: Partial<PromptHistoryItem>) => {
    const updatedItems = history.map(item => 
      item.id === id ? { ...item, ...updates, updatedAt: new Date() } : item
    )
    
    setHistory(updatedItems)
    setLocalHistory({
      items: updatedItems,
      lastSync: new Date(),
    })

    // Sync to database
    try {
      const response = await fetch(`/api/history/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })
      
      if (!response.ok) {
        throw new Error('Failed to update in database')
      }
    } catch (err) {
      console.warn('Failed to sync update to database:', err)
    }
  }, [history, setLocalHistory])

  // Delete prompt
  const deletePrompt = useCallback(async (id: string) => {
    const updatedItems = history.filter(item => item.id !== id)
    setHistory(updatedItems)
    setLocalHistory({
      items: updatedItems,
      lastSync: new Date(),
    })

    // Sync to database
    try {
      const response = await fetch(`/api/history/${id}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        throw new Error('Failed to delete from database')
      }
    } catch (err) {
      console.warn('Failed to sync deletion to database:', err)
    }
  }, [history, setLocalHistory])

  // Clear all history
  const clearHistory = useCallback(async () => {
    setHistory([])
    setLocalHistory({
      items: [],
      lastSync: new Date(),
    })

    try {
      const response = await fetch('/api/history', {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        throw new Error('Failed to clear database')
      }
    } catch (err) {
      console.warn('Failed to clear database:', err)
    }
  }, [setLocalHistory])

  // Toggle favorite
  const toggleFavorite = useCallback(async (id: string) => {
    const item = history.find(h => h.id === id)
    if (!item) return

    await updatePrompt(id, { isFavorite: !item.isFavorite })
  }, [history, updatePrompt])

  // Sync with database
  const syncWithDatabase = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/history')
      if (!response.ok) {
        throw new Error('Failed to fetch from database')
      }

      const databaseItems: PromptHistoryItem[] = await response.json()
      
      // Merge local and database items (database is source of truth)
      const mergedItems = databaseItems.map(dbItem => ({
        ...dbItem,
        timestamp: dbItem.timestamp instanceof Date ? dbItem.timestamp : new Date(dbItem.timestamp),
        createdAt: dbItem.createdAt ? (dbItem.createdAt instanceof Date ? dbItem.createdAt : new Date(dbItem.createdAt)) : undefined,
        updatedAt: dbItem.updatedAt ? (dbItem.updatedAt instanceof Date ? dbItem.updatedAt : new Date(dbItem.updatedAt)) : undefined,
      }))

      setHistory(mergedItems)
      setLocalHistory({
        items: mergedItems,
        lastSync: new Date(),
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sync with database')
      console.error('Sync error:', err)
    } finally {
      setIsLoading(false)
    }
  }, [setLocalHistory])

  // Auto-sync periodically
  useEffect(() => {
    const interval = setInterval(syncWithDatabase, SYNC_INTERVAL)
    return () => clearInterval(interval)
  }, [syncWithDatabase])

  // Filter history based on current filters
  const filteredHistory = history.filter(item => {
    if (filters.search && !item.prompt.toLowerCase().includes(filters.search.toLowerCase())) {
      return false
    }
    
    if (filters.status && !filters.status.includes(item.status)) {
      return false
    }
    
    if (filters.favorites && !item.isFavorite) {
      return false
    }
    
    if (filters.dateRange) {
      const itemDate = item.timestamp instanceof Date ? item.timestamp : new Date(item.timestamp)
      if (itemDate < filters.dateRange.start || itemDate > filters.dateRange.end) {
        return false
      }
    }
    
    if (filters.tags && filters.tags.length > 0) {
      const itemTags = item.tags || []
      if (!filters.tags.some(tag => itemTags.includes(tag))) {
        return false
      }
    }

    return true
  })

  // Categorize history by date
  const categorizedHistory = (() => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000)
    const thisWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)

    const categories = {
      today: [] as PromptHistoryItem[],
      yesterday: [] as PromptHistoryItem[],
      thisWeek: [] as PromptHistoryItem[],
      older: [] as PromptHistoryItem[],
    }

    filteredHistory.forEach(item => {
      const itemDate = item.timestamp instanceof Date ? item.timestamp : new Date(item.timestamp)
      
      if (itemDate >= today) {
        categories.today.push(item)
      } else if (itemDate >= yesterday) {
        categories.yesterday.push(item)
      } else if (itemDate >= thisWeek) {
        categories.thisWeek.push(item)
      } else {
        categories.older.push(item)
      }
    })

    return categories
  })()

  // Get search suggestions
  const getSearchSuggestions = useCallback((query: string): string[] => {
    const suggestions = new Set<string>()
    const lowerQuery = query.toLowerCase()

    history.forEach(item => {
      if (item.prompt.toLowerCase().includes(lowerQuery)) {
        suggestions.add(item.prompt)
      }
      
      item.tags?.forEach(tag => {
        if (tag.toLowerCase().includes(lowerQuery)) {
          suggestions.add(tag)
        }
      })
    })

    return Array.from(suggestions).slice(0, 5)
  }, [history])

  return {
    history: filteredHistory,
    categorizedHistory,
    isLoading,
    error,
    filters,
    setFilters,
    addPrompt,
    updatePrompt,
    deletePrompt,
    clearHistory,
    toggleFavorite,
    syncWithDatabase,
    getSearchSuggestions,
    stats: {
      total: history.length,
      favorites: history.filter(h => h.isFavorite).length,
      successful: history.filter(h => h.status === 'success').length,
      pending: history.filter(h => h.status === 'pending').length,
      errors: history.filter(h => h.status === 'error').length,
    }
  }
} 