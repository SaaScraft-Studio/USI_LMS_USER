import type { Metadata } from 'next'
import './globals.css'
import { Poppins, Francois_One } from 'next/font/google'
import { Toaster } from '@/components/ui/sonner'

const poppins = Poppins({
  variable: '--font-poppins',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
})

const francoisOne = Francois_One({
  variable: '--font-francois',
  subsets: ['latin'],
  weight: '400',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Urological Society of India-LMS',
  description: 'USI Learning Management System',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${poppins.variable} ${francoisOne.variable} font-sans antialiased`}
      >
            {children}
            <Toaster />
      
        
      </body>
    </html>
  )
}
