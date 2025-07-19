import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { TabNavigation } from '@/components/TabNavigation'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Analytics Hub - Dashboard & Transaction Monitoring',
  description: 'Umfassende Analytics Dashboard Anwendung mit AI-gestützter SQL-Generierung, dynamischen Datenvisualisierungen und Transaction Monitoring',
  keywords: ['analytics', 'dashboard', 'sql', 'ai', 'data visualization', 'transaction monitoring', 'next.js'],
  authors: [{ name: 'Analytics Hub Team' }],
  viewport: 'width=device-width, initial-scale=1',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="de" suppressHydrationWarning>
      <body className={inter.className}>
        <div className="min-h-screen bg-background font-sans antialiased">
          <TabNavigation />
          <main className="flex-1">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}
