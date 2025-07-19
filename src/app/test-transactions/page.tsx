'use client'

import { useEffect, useState } from 'react'

export default function TestTransactionsPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/transactions?merchant_id=merchant_008&limit=5')
        if (!response.ok) {
          throw new Error('Failed to fetch')
        }
        const result = await response.json()
        setData(result)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) return <div className="p-4">Loading...</div>
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Test Transactions API</h1>
      
      <div className="mb-4">
        <strong>Total Transactions:</strong> {data?.pagination?.totalTransactions || 'N/A'}
      </div>
      
      <div className="mb-4">
        <strong>Merchant ID:</strong> {data?.merchant_id || 'N/A'}
      </div>

      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Transactions:</h2>
        {data?.transactions?.map((transaction: any, index: number) => (
          <div key={index} className="border p-2 rounded">
            <div><strong>ID:</strong> {transaction.transaction_id}</div>
            <div><strong>Event:</strong> {transaction.event_type}</div>
            <div><strong>Amount:</strong> {transaction.total_amount} {transaction.currency}</div>
            <div><strong>Time:</strong> {transaction.time}</div>
            <div><strong>Merchant:</strong> {transaction.merchant_name}</div>
            <div><strong>Status:</strong> {transaction.status}</div>
          </div>
        )) || <div>No transactions found</div>}
      </div>

      <div className="mt-4">
        <h2 className="text-lg font-semibold">Raw Data:</h2>
        <pre className="bg-gray-100 p-2 text-xs overflow-auto">
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    </div>
  )
} 