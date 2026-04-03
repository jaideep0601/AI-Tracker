import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'ThinkStream',
  description: 'AI developments tracker',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, background: '#080B0F' }}>
        {children}
      </body>
    </html>
  )
}
