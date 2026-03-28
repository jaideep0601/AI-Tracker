import type { Metadata } from 'next'
import './globals.css'
import Header from '@/components/Common/Header'

export const metadata: Metadata = {
  title: 'ThinkStream - AI Tracker',
  description: 'Centralized AI Developments Aggregation Platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50">
        <Header />
        <main className="max-w-7xl mx-auto px-4 py-8">
          {children}
        </main>
        <footer className="bg-white border-t border-gray-200 mt-12">
          <div className="max-w-7xl mx-auto px-4 py-6 text-center text-gray-600 text-sm">
            <p>ThinkStream • Phase 1 Localhost Development • {new Date().getFullYear()}</p>
          </div>
        </footer>
      </body>
    </html>
  )
}
