import { NextRequest, NextResponse } from 'next/server'
import { QueryGenerationRequest, QueryGenerationResponse } from '@/types'

// Simulated AI agent for SQL generation
// In a real implementation, this would connect to OpenAI, Claude, or another LLM
async function generateSQLFromPrompt(prompt: string): Promise<QueryGenerationResponse> {
  // Simulate AI processing delay
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000))

  // Sample response based on prompt analysis
  const normalizedPrompt = prompt.toLowerCase()
  
  let sqlQuery = ''
  let explanation = ''
  let estimatedComplexity: 'low' | 'medium' | 'high' = 'medium'
  let suggestedCharts: any[] = []

  // Simple pattern matching for demo purposes
  if (normalizedPrompt.includes('umsatz') || normalizedPrompt.includes('revenue')) {
    sqlQuery = `SELECT 
  DATE_TRUNC('month', created_at) as month,
  SUM(amount) as total_revenue,
  COUNT(*) as order_count
FROM orders 
WHERE created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
GROUP BY DATE_TRUNC('month', created_at)
ORDER BY month;`
    
    explanation = 'Diese Abfrage analysiert die Umsatzentwicklung über die letzten 6 Monate, gruppiert nach Monaten.'
    estimatedComplexity = 'low'
    suggestedCharts = [
      { type: 'line', xAxis: 'month', yAxis: 'total_revenue', title: 'Umsatzentwicklung' },
      { type: 'bar', xAxis: 'month', yAxis: 'order_count', title: 'Anzahl Bestellungen' }
    ]
  } else if (normalizedPrompt.includes('kategorie') || normalizedPrompt.includes('category')) {
    sqlQuery = `SELECT 
  category,
  COUNT(*) as product_count,
  AVG(price) as avg_price,
  SUM(sales_count) as total_sales
FROM products 
GROUP BY category
ORDER BY total_sales DESC
LIMIT 10;`
    
    explanation = 'Diese Abfrage analysiert Produktkategorien nach Verkaufszahlen und durchschnittlichen Preisen.'
    estimatedComplexity = 'low'
    suggestedCharts = [
      { type: 'pie', dataKey: 'total_sales', title: 'Verkäufe nach Kategorie' },
      { type: 'bar', xAxis: 'category', yAxis: 'avg_price', title: 'Durchschnittspreis nach Kategorie' }
    ]
  } else if (normalizedPrompt.includes('region') || normalizedPrompt.includes('standort')) {
    sqlQuery = `SELECT 
  r.region_name,
  COUNT(DISTINCT c.customer_id) as customer_count,
  SUM(o.amount) as total_revenue,
  AVG(o.amount) as avg_order_value
FROM regions r
JOIN customers c ON r.region_id = c.region_id
JOIN orders o ON c.customer_id = o.customer_id
WHERE o.created_at >= DATE_SUB(NOW(), INTERVAL 1 YEAR)
GROUP BY r.region_name
ORDER BY total_revenue DESC;`
    
    explanation = 'Diese Abfrage analysiert Kundensegmente und Umsätze nach geografischen Regionen.'
    estimatedComplexity = 'high'
    suggestedCharts = [
      { type: 'bar', xAxis: 'region_name', yAxis: 'total_revenue', title: 'Umsatz nach Region' },
      { type: 'scatter', xAxis: 'customer_count', yAxis: 'avg_order_value', title: 'Kunden vs. Bestellwert' }
    ]
  } else if (normalizedPrompt.includes('trend') || normalizedPrompt.includes('entwicklung')) {
    sqlQuery = `SELECT 
  DATE(created_at) as date,
  COUNT(*) as daily_orders,
  SUM(amount) as daily_revenue,
  AVG(amount) as avg_order_value,
  LAG(COUNT(*)) OVER (ORDER BY DATE(created_at)) as prev_day_orders
FROM orders 
WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
GROUP BY DATE(created_at)
ORDER BY date;`
    
    explanation = 'Diese Abfrage zeigt tägliche Trends für die letzten 30 Tage mit Vergleichswerten.'
    estimatedComplexity = 'medium'
    suggestedCharts = [
      { type: 'line', xAxis: 'date', yAxis: 'daily_revenue', title: 'Täglicher Umsatz' },
      { type: 'area', xAxis: 'date', yAxis: 'daily_orders', title: 'Tägliche Bestellungen' }
    ]
  } else {
    // Default query for unrecognized prompts
    sqlQuery = `SELECT 
  'sample_metric' as metric,
  COUNT(*) as count,
  AVG(value) as average_value
FROM sample_table 
WHERE created_at >= DATE_SUB(NOW(), INTERVAL 1 MONTH)
GROUP BY metric
ORDER BY count DESC
LIMIT 10;`
    
    explanation = 'Beispielabfrage für die eingegebene Anfrage. Für bessere Ergebnisse verwenden Sie spezifische Begriffe wie "Umsatz", "Kategorie" oder "Region".'
    estimatedComplexity = 'low'
    suggestedCharts = [
      { type: 'bar', xAxis: 'metric', yAxis: 'count', title: 'Metriken Übersicht' }
    ]
  }

  return {
    sqlQuery,
    explanation,
    estimatedComplexity,
    suggestedCharts
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: QueryGenerationRequest = await request.json()
    
    if (!body.prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      )
    }

    const response = await generateSQLFromPrompt(body.prompt)
    
    return NextResponse.json(response)
  } catch (error) {
    console.error('Failed to generate SQL query:', error)
    return NextResponse.json(
      { error: 'Failed to generate SQL query' },
      { status: 500 }
    )
  }
} 