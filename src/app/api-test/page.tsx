import { createClient } from '@/lib/supabase/server'

async function getTransactionData() {
  try {
    const supabase = await createClient()
    
    const { data, error, count } = await supabase
      .from('basic_paying_flow')
      .select('*', { count: 'exact' })
      .eq('merchant_id', 'merchant_008')
      .order('time', { ascending: false })
      .limit(5)

    return {
      success: true,
      data: data || [],
      count: count || 0,
      error: null
    }
  } catch (err) {
    return {
      success: false,
      data: [],
      count: 0,
      error: err instanceof Error ? err.message : 'Unknown error'
    }
  }
}

export default async function ApiTestPage() {
  const result = await getTransactionData()

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Server-Side API Test</h1>
      
      <div className="mb-4">
        <strong>Success:</strong> {result.success ? 'Yes' : 'No'}
      </div>

      {result.error && (
        <div className="mb-4 text-red-500">
          <strong>Error:</strong> {result.error}
        </div>
      )}

      <div className="mb-4">
        <strong>Total Count:</strong> {result.count}
      </div>

      <div className="mb-4">
        <strong>Records Found:</strong> {result.data.length}
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">First 5 Transactions:</h2>
        {result.data.map((transaction: any, index: number) => (
          <div key={index} className="border p-3 rounded">
            <div><strong>Transaction ID:</strong> {transaction.transaction_id}</div>
            <div><strong>Event Type:</strong> {transaction.event_type}</div>
            <div><strong>Merchant ID:</strong> {transaction.merchant_id}</div>
            <div><strong>Amount:</strong> {transaction.total_amount} {transaction.currency}</div>
            <div><strong>Time:</strong> {transaction.time}</div>
            <div><strong>Merchant Name:</strong> {transaction.merchant_name}</div>
            <div><strong>User ID:</strong> {transaction.user_id}</div>
            <div><strong>Device:</strong> {transaction.device_type}</div>
          </div>
        ))}
      </div>
    </div>
  )
} 