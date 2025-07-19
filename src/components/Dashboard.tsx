'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Database, 
  Clock, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle, 
  BarChart3,
  Code,
  Play,
  Download,
  Share
} from 'lucide-react'
import { PromptInput } from './PromptInput'
import { DynamicChart } from './DynamicChart'
import { HistorySidebar } from './PromptHistory/HistorySidebar'
import { usePromptHistory } from '@/hooks/usePromptHistory'
import { ChartConfig, QueryResult, DashboardState } from '@/types'

export function Dashboard() {
  const {
    history,
    categorizedHistory,
    filters,
    setFilters,
    addPrompt,
    updatePrompt,
    deletePrompt,
    clearHistory,
    toggleFavorite,
    getSearchSuggestions,
    stats
  } = usePromptHistory()

  const [dashboardState, setDashboardState] = useState<DashboardState>({
    charts: [],
    isLoading: false
  })

  const [currentPrompt, setCurrentPrompt] = useState('')
  const [currentSQL, setCurrentSQL] = useState('')
  const [executionTime, setExecutionTime] = useState<number | null>(null)

  const handlePromptSubmit = async (prompt: string) => {
    setDashboardState(prev => ({ ...prev, isLoading: true, error: undefined }))
    setCurrentPrompt(prompt)

    try {
      // Step 1: Generate SQL from prompt
      const generateResponse = await fetch('/api/generate-query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      })

      if (!generateResponse.ok) {
        throw new Error('Failed to generate SQL query')
      }

      const { sqlQuery, explanation, suggestedCharts } = await generateResponse.json()
      setCurrentSQL(sqlQuery)

      // Step 2: Execute the generated SQL
      const executeStart = Date.now()
      const executeResponse = await fetch('/api/execute-query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sqlQuery })
      })

      if (!executeResponse.ok) {
        const errorData = await executeResponse.json()
        throw new Error(errorData.error || 'Failed to execute query')
      }

      const queryResult: QueryResult = await executeResponse.json()
      const executionTimeMs = Date.now() - executeStart
      setExecutionTime(executionTimeMs)

      // Step 3: Create charts based on suggestions and data
      const charts: ChartConfig[] = suggestedCharts.map((chart: any, index: number) => ({
        ...chart,
        title: chart.title || `Chart ${index + 1}`
      }))

      // Auto-generate additional charts based on data structure
      if (queryResult.columns.length >= 2 && charts.length === 0) {
        const xAxis = queryResult.columns[0]
        const yAxis = queryResult.columns.find(col => 
          queryResult.data.some(row => typeof row[col] === 'number')
        ) || queryResult.columns[1]

        charts.push({
          type: 'bar',
          xAxis,
          yAxis,
          title: `${yAxis} nach ${xAxis}`
        })

        if (queryResult.columns.length >= 3) {
          const thirdColumn = queryResult.columns[2]
          charts.push({
            type: 'line',
            xAxis,
            yAxis: thirdColumn,
            title: `${thirdColumn} Trend`
          })
        }
      }

      setDashboardState({
        queryResult,
        charts,
        isLoading: false,
        error: undefined
      })

      // Add to history
      await addPrompt({
        prompt,
        sqlQuery,
        status: 'success',
        executionTime: executionTimeMs,
        resultCount: queryResult.rowCount,
        chartTypes: charts.map(c => c.type),
        isFavorite: false
      })

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      
      setDashboardState({
        charts: [],
        isLoading: false,
        error: errorMessage
      })

      // Add failed attempt to history
      await addPrompt({
        prompt,
        status: 'error',
        isFavorite: false
      })
    }
  }

  const handleHistorySelect = (historyItem: any) => {
    if (historyItem.sqlQuery && historyItem.status === 'success') {
      // Re-execute the historical query
      handlePromptSubmit(historyItem.prompt)
    } else {
      // Just set the prompt for editing
      setCurrentPrompt(historyItem.prompt)
    }
  }

  const handleExportHistory = () => {
    const dataStr = JSON.stringify(history, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `analytics-dashboard-history-${new Date().toISOString().split('T')[0]}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  const handleImportHistory = async (file: File) => {
    try {
      const text = await file.text()
      const importedHistory = JSON.parse(text)
      // In a real implementation, you would validate and merge the imported history
      console.log('Imported history:', importedHistory)
      // For now, just log it
    } catch (error) {
      console.error('Failed to import history:', error)
    }
  }

  const suggestions = getSearchSuggestions(filters.search || '')

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-background">
      {/* History Sidebar */}
      <HistorySidebar
        history={history}
        categorizedHistory={categorizedHistory}
        filters={filters}
        onFiltersChange={setFilters}
        onSelectPrompt={handleHistorySelect}
        onDeletePrompt={deletePrompt}
        onToggleFavorite={toggleFavorite}
        onClearHistory={clearHistory}
        onExportHistory={handleExportHistory}
        onImportHistory={handleImportHistory}
        stats={stats}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="border-b bg-background p-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
              <p className="text-muted-foreground">
                Natürliche Sprache zu SQL-Abfragen und Datenvisualisierung
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="flex items-center gap-1">
                <Database className="w-3 h-3" />
                {stats.total} Abfragen
              </Badge>
              <Badge variant="secondary" className="flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                {stats.successful} erfolgreich
              </Badge>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-auto">
          <div className="p-6 space-y-6">
            {/* Prompt Input */}
            <PromptInput
              onSubmit={handlePromptSubmit}
              isLoading={dashboardState.isLoading}
              suggestions={suggestions}
              placeholder="Beschreiben Sie Ihre Datenanalyse in natürlicher Sprache..."
            />

            {/* Current Query Info */}
            {(currentPrompt || currentSQL) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Code className="w-4 h-4" />
                    Aktuelle Abfrage
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {currentPrompt && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">Prompt:</h4>
                      <p className="text-sm bg-muted p-3 rounded">{currentPrompt}</p>
                    </div>
                  )}
                  {currentSQL && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">Generierte SQL:</h4>
                      <pre className="text-xs bg-muted p-3 rounded overflow-x-auto whitespace-pre-wrap">
                        {currentSQL}
                      </pre>
                    </div>
                  )}
                  {executionTime && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      Ausführungszeit: {executionTime}ms
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Error Display */}
            {dashboardState.error && (
              <Card className="border-destructive">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 text-destructive">
                    <AlertCircle className="w-4 h-4" />
                    <span className="font-medium">Fehler:</span>
                  </div>
                  <p className="mt-2 text-sm">{dashboardState.error}</p>
                </CardContent>
              </Card>
            )}

            {/* Charts Display */}
            {dashboardState.queryResult && dashboardState.charts.length > 0 && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Datenvisualisierung
                  </h2>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </Button>
                    <Button variant="outline" size="sm">
                      <Share className="w-4 h-4 mr-2" />
                      Teilen
                    </Button>
                  </div>
                </div>

                <Tabs defaultValue="charts" className="space-y-4">
                  <TabsList>
                    <TabsTrigger value="charts">Charts</TabsTrigger>
                    <TabsTrigger value="data">Rohdaten</TabsTrigger>
                  </TabsList>

                  <TabsContent value="charts" className="space-y-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {dashboardState.charts.map((chart, index) => (
                        <DynamicChart
                          key={index}
                          config={chart}
                          data={dashboardState.queryResult!.data}
                        />
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="data">
                    <Card>
                      <CardHeader>
                        <CardTitle>Rohdaten</CardTitle>
                        <CardDescription>
                          {dashboardState.queryResult.rowCount} Zeilen • {dashboardState.queryResult.columns.length} Spalten
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b">
                                {dashboardState.queryResult.columns.map(column => (
                                  <th key={column} className="text-left p-2 font-medium">
                                    {column}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {dashboardState.queryResult.data.map((row, index) => (
                                <tr key={index} className="border-b hover:bg-muted/50">
                                  {dashboardState.queryResult!.columns.map(column => (
                                    <td key={column} className="p-2">
                                      {row[column]?.toString() || '-'}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            )}

            {/* Loading State */}
            {dashboardState.isLoading && (
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-center py-8">
                    <div className="flex items-center gap-3">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                      <span>Verarbeite Anfrage...</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Welcome State */}
            {!dashboardState.queryResult && !dashboardState.isLoading && !dashboardState.error && (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <TrendingUp className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">Willkommen im Analytics Dashboard</h3>
                    <p className="text-muted-foreground max-w-md mx-auto">
                      Beschreiben Sie Ihre Datenanalyse in natürlicher Sprache und erhalten Sie 
                      automatisch generierte SQL-Abfragen und Visualisierungen.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 