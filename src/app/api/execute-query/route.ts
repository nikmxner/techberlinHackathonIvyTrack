import { NextRequest, NextResponse } from 'next/server'
import { QueryResult } from '@/types'

// Simulated database execution
// In a real implementation, this would connect to your actual database
async function executeSQL(sqlQuery: string): Promise<QueryResult> {
  // Simulate query execution delay
  await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1500))

  // Generate sample data based on query patterns
  const normalizedQuery = sqlQuery.toLowerCase()
  
  let data: Record<string, any>[] = []
  let columns: string[] = []

  if (normalizedQuery.includes('orders') && normalizedQuery.includes('month')) {
    // Revenue by month data
    columns = ['month', 'total_revenue', 'order_count']
    const months = ['2024-01', '2024-02', '2024-03', '2024-04', '2024-05', '2024-06']
    data = months.map(month => ({
      month,
      total_revenue: Math.floor(Math.random() * 50000) + 20000,
      order_count: Math.floor(Math.random() * 200) + 100
    }))
  } else if (normalizedQuery.includes('products') && normalizedQuery.includes('category')) {
    // Category analysis data
    columns = ['category', 'product_count', 'avg_price', 'total_sales']
    const categories = ['Elektronik', 'Kleidung', 'Bücher', 'Sport', 'Haus & Garten', 'Spielwaren']
    data = categories.map(category => ({
      category,
      product_count: Math.floor(Math.random() * 500) + 50,
      avg_price: Math.floor(Math.random() * 200) + 25,
      total_sales: Math.floor(Math.random() * 10000) + 1000
    }))
  } else if (normalizedQuery.includes('regions') && normalizedQuery.includes('customers')) {
    // Regional analysis data
    columns = ['region_name', 'customer_count', 'total_revenue', 'avg_order_value']
    const regions = ['Nord', 'Süd', 'Ost', 'West', 'Zentral']
    data = regions.map(region_name => ({
      region_name,
      customer_count: Math.floor(Math.random() * 1000) + 200,
      total_revenue: Math.floor(Math.random() * 100000) + 30000,
      avg_order_value: Math.floor(Math.random() * 150) + 50
    }))
  } else if (normalizedQuery.includes('date') && normalizedQuery.includes('daily')) {
    // Daily trends data
    columns = ['date', 'daily_orders', 'daily_revenue', 'avg_order_value', 'prev_day_orders']
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - 30)
    
    data = Array.from({ length: 30 }, (_, i) => {
      const date = new Date(startDate)
      date.setDate(date.getDate() + i)
      const dailyOrders = Math.floor(Math.random() * 50) + 20
      
      return {
        date: date.toISOString().split('T')[0],
        daily_orders: dailyOrders,
        daily_revenue: Math.floor(dailyOrders * (Math.random() * 100 + 50)),
        avg_order_value: Math.floor(Math.random() * 80) + 40,
        prev_day_orders: i > 0 ? data[i-1]?.daily_orders || dailyOrders - 5 : null
      }
    })
  } else {
    // Default sample data
    columns = ['metric', 'count', 'average_value']
    const metrics = ['Verkäufe', 'Besucher', 'Conversions', 'Returns', 'Reviews']
    data = metrics.map(metric => ({
      metric,
      count: Math.floor(Math.random() * 1000) + 100,
      average_value: Math.floor(Math.random() * 500) + 50
    }))
  }

  // Sometimes simulate errors
  if (Math.random() < 0.05) { // 5% chance of error
    throw new Error('Simulated database connection error')
  }

  const executionTime = Math.floor(Math.random() * 2000) + 100 // 100-2100ms

  return {
    data,
    columns,
    rowCount: data.length,
    executionTime
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { sqlQuery } = body

    if (!sqlQuery) {
      return NextResponse.json(
        { error: 'SQL query is required' },
        { status: 400 }
      )
    }

    // Basic SQL injection protection (very basic - use proper validation in production)
    const dangerousPatterns = ['drop', 'delete', 'truncate', 'alter', 'create', 'insert', 'update']
    const normalizedQuery = sqlQuery.toLowerCase()
    
    for (const pattern of dangerousPatterns) {
      if (normalizedQuery.includes(pattern)) {
        return NextResponse.json(
          { error: 'Query contains potentially dangerous operations' },
          { status: 400 }
        )
      }
    }

    const result = await executeSQL(sqlQuery)
    
    return NextResponse.json(result)
  } catch (error) {
    console.error('Failed to execute SQL query:', error)
    
    // Return different error messages based on error type
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to execute SQL query' },
      { status: 500 }
    )
  }
} 