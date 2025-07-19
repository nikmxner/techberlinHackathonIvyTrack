import { NextRequest, NextResponse } from 'next/server'
import { TransactionStats, ErrorCategory } from '@/types/transactions'

export async function GET(request: NextRequest) {
  try {
    // In real implementation, this would query Supabase
    // For now, generate mock statistics based on the transaction structure
    
    const stats: TransactionStats = {
      total: 12847,
      successful: 10234,
      failed: 2156,
      pending: 457,
      successRate: 79.6,
      avgAmount: 127.84,
      totalVolume: 1641893.72,
      errorsByCategory: {
        network: 312,
        validation: 189,
        authentication: 98,
        database: 67,
        timeout: 445,
        payment: 823,
        checkout: 222,
        unknown: 0
      },

      byDeviceType: {
        desktop: 6423,
        mobile: 5234,
        tablet: 1190
      },
      byCurrency: {
        EUR: 7823,
        USD: 3456,
        GBP: 1234,
        JPY: 334
      }
    }
    
    return NextResponse.json(stats)
    
  } catch (error) {
    console.error('Error fetching transaction stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch transaction statistics' },
      { status: 500 }
    )
  }
} 