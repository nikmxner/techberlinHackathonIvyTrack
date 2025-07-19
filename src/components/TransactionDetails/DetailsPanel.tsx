'use client'

import { Transaction } from '@/types/transactions'
import { SuccessDetails } from './SuccessDetails'
import { FailureDetails } from './FailureDetails'
import { Card, CardContent } from '@/components/ui/card'
import { Receipt, TrendingUp } from 'lucide-react'

interface TransactionDetailsProps {
  transaction: Transaction | null
  onTransactionUpdate: (transaction: Transaction) => void
}

export function TransactionDetails({ transaction, onTransactionUpdate }: TransactionDetailsProps) {
  if (!transaction) {
    return (
      <div className="flex items-center justify-center h-full bg-muted/20">
        <Card className="w-96">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                <Receipt className="w-6 h-6 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-medium">Keine Transaktion ausgewählt</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Wählen Sie eine Transaktion aus der Liste links aus, um Details anzuzeigen.
                </p>
              </div>
              
              {/* Quick stats or tips */}
              <div className="pt-4 border-t space-y-2">
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <TrendingUp className="w-4 h-4" />
                  <span>98.4% Erfolgsrate heute</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Fehlgeschlagene Transaktionen werden prominent angezeigt und 
                  enthalten AI-generierte Lösungsanleitungen.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="h-full overflow-auto">
      {transaction.status === 'failed' ? (
        <FailureDetails 
          transaction={transaction} 
          onTransactionUpdate={onTransactionUpdate}
        />
      ) : (
        <SuccessDetails 
          transaction={transaction} 
          onTransactionUpdate={onTransactionUpdate}
        />
      )}
    </div>
  )
} 