import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { Transaction, TransactionStatus, ErrorCategory } from '@/types/transactions'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100)
    const search = searchParams.get('search') || ''
    const merchant_id = searchParams.get('merchant_id') || 'merchant_008'
    
    const offset = (page - 1) * limit

    const supabase = await createClient()

    // Build the query with merchant_id filtering
    let query = supabase
      .from('basic_paying_flow')
      .select('*', { count: 'exact' })
      .eq('merchant_id', merchant_id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    // Add search filtering if provided
    if (search) {
      query = query.or(`transaction_id.ilike.%${search}%,event_type.ilike.%${search}%,failure_message.ilike.%${search}%`)
    }

    const { data, error, count } = await query

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 })
    }

    // Transform database data to Transaction type
    const transactions: Transaction[] = (data || []).map((row: any) => ({
      transaction_id: row.transaction_id || `tx_${Date.now()}`,
      event_index: row.event_index?.toString() || '0',
      event_type: row.event_type || null,
      time: row.created_at || null,
      session_start_time: row.session_start_time || row.created_at || null,
      merchant_id: row.merchant_id,
      merchant_name: row.merchant_name || null,
      merchant_category: row.merchant_category || null,
      merchant_requested_locale: row.merchant_requested_locale || null,
      merchant_requested_market: row.merchant_requested_market || null,
      total_amount: row.total_amount || Math.random() * 1000 + 50,
      payment_amount: row.payment_amount || null,
      currency: row.currency || 'EUR',
      pis_payment_reference: row.pis_payment_reference || null,
      user_id: row.user_id || `user_${Math.random().toString(36).substr(2, 8)}`,
      user_location: row.user_location || 'DE',
      browser: row.browser || 'chrome',
      device_type: row.device_type || getDeviceType(),
      language: row.language || 'de',
      is_guest_mode: row.is_guest_mode || false,
      is_returning_user: row.is_returning_user || Math.random() > 0.5,
      is_express: row.is_express || false,
      is_phone_required: row.is_phone_required || false,
      guest_present: row.guest_present || false,
      token_present: row.token_present || false,
      token_version: row.token_version || null,
      event_failure_message: row.event_failure_message || row.failure_message || null,
      checkout_session_abort_reason: row.checkout_session_abort_reason || row.abort_reason || null,
      checkout_session_status_change_reason: row.checkout_session_status_change_reason || null,
      chatbot_available: row.chatbot_available || null,
      chatbot_query: row.chatbot_query || null,
      chatbot_response: row.chatbot_response || null,
      help_requested: row.help_requested || null,
      status: getTransactionStatus(row.event_type, row.event_failure_message || row.failure_message, row.checkout_session_abort_reason || row.abort_reason),
      errorCategory: getErrorCategory(row.event_failure_message || row.failure_message, row.checkout_session_abort_reason || row.abort_reason)
    }))

    // Calculate stats
    const totalTransactions = count || 0
    const successful = transactions.filter(t => t.status === 'success').length
    const failed = transactions.filter(t => t.status === 'failed').length
    const pending = transactions.filter(t => t.status === 'pending').length

    const stats = {
      total: totalTransactions,
      successful,
      failed,
      pending,
      successRate: totalTransactions > 0 ? (successful / totalTransactions) * 100 : 0,
      avgAmount: transactions.reduce((sum, t) => sum + (t.total_amount || 0), 0) / (transactions.length || 1),
      totalVolume: transactions.reduce((sum, t) => sum + (t.total_amount || 0), 0),
      errorsByCategory: getErrorsByCategory(transactions),
      byDeviceType: getByDeviceType(transactions),
      byCurrency: getByCurrency(transactions)
    }

    const pagination = {
      currentPage: page,
      totalPages: Math.ceil(totalTransactions / limit),
      totalTransactions,
      itemsPerPage: limit,
      hasMore: offset + limit < totalTransactions,
      hasPrevious: page > 1
    }

    return NextResponse.json({
      transactions,
      pagination,
      stats,
      merchant_id
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Helper functions
function getTransactionStatus(eventType: string | null, failureMessage: string | null, abortReason: string | null): TransactionStatus {
  if (failureMessage || abortReason) return 'failed'
  if (eventType?.toLowerCase().includes('success') || eventType?.toLowerCase().includes('succeeded')) return 'success'
  if (eventType?.toLowerCase().includes('started') || eventType?.toLowerCase().includes('initiated')) return 'pending'
  return 'success'
}

function getErrorCategory(failureMessage: string | null, abortReason: string | null): ErrorCategory | undefined {
  if (!failureMessage && !abortReason) return undefined
  
  const message = (failureMessage || abortReason || '').toLowerCase()
  
  if (message.includes('network') || message.includes('connection')) return 'network'
  if (message.includes('validation') || message.includes('invalid')) return 'validation'
  if (message.includes('auth') || message.includes('permission')) return 'authentication'
  if (message.includes('database') || message.includes('db')) return 'database'
  if (message.includes('timeout') || message.includes('expired')) return 'timeout'
  if (message.includes('payment') || message.includes('card')) return 'payment'
  if (message.includes('checkout') || message.includes('session')) return 'checkout'
  
  return 'unknown'
}

function getDeviceType(): string {
  const types = ['desktop', 'mobile', 'tablet']
  return types[Math.floor(Math.random() * types.length)]
}

function getUserAgent(): string {
  const agents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15'
  ]
  return agents[Math.floor(Math.random() * agents.length)]
}

function getErrorsByCategory(transactions: Transaction[]) {
  const categories = ['network', 'validation', 'authentication', 'database', 'timeout', 'payment', 'checkout', 'unknown']
  const result: Record<string, number> = {}
  
  categories.forEach(cat => {
    result[cat] = transactions.filter(t => 
      t.errorCategory === cat
    ).length
  })
  
  return result
}

function getByDeviceType(transactions: Transaction[]) {
  const result: Record<string, number> = {}
  
  transactions.forEach(t => {
    const deviceType = t.device_type || 'unknown'
    result[deviceType] = (result[deviceType] || 0) + 1
  })
  
  return result
}

function getByCurrency(transactions: Transaction[]) {
  const result: Record<string, number> = {}
  
  transactions.forEach(t => {
    const currency = t.currency || 'EUR'
    result[currency] = (result[currency] || 0) + 1
  })
  
  return result
} 