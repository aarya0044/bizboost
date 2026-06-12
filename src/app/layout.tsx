import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'BizBoost — Free Business Intelligence',
  description: 'Analyze business locations and optimize your digital presence with AI',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
      </head>
      <body style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>{children}</body>
    </html>
  )
}
