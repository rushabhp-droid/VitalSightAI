import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'VitalSightAI - AI-Powered Health Analysis',
  description: 'Analyze blood reports and prescriptions with AI. Get detailed health insights, medicine pros/cons, and personalized recommendations.',
  keywords: ['blood test', 'health analysis', 'medicine', 'prescription', 'AI', 'medical'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#fff',
              color: '#1e293b',
              boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
            },
          }}
        />
        {children}
      </body>
    </html>
  )
}