import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import SessionProvider from '@/components/SessionProvider'
import './sentry.client.config'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'Cost Signal - Weekly Economic Signal for U.S. Consumers',
    template: '%s | Cost Signal',
  },
  description: 'A simple weekly check on whether recent U.S. economic changes are likely to affect everyday living costs. Get notified every Monday with a clear signal (OK, CAUTION, or RISK) based on official government data.',
  keywords: ['economic signal', 'cost of living', 'inflation', 'gas prices', 'interest rates', 'unemployment', 'US economy', 'consumer economics'],
  authors: [{ name: 'Cost Signal' }],
  creator: 'Cost Signal',
  publisher: 'Cost Signal',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://cost-signal.vercel.app'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    title: 'Cost Signal - Weekly Economic Signal for U.S. Consumers',
    description: 'Get a clear weekly signal about whether recent U.S. economic changes are likely to affect your everyday living costs.',
    siteName: 'Cost Signal',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cost Signal - Weekly Economic Signal for U.S. Consumers',
    description: 'Get a clear weekly signal about whether recent U.S. economic changes are likely to affect your everyday living costs.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // Add your verification codes here when available
    // google: 'your-google-verification-code',
    // yandex: 'your-yandex-verification-code',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#2563eb" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Cost Signal" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body className={inter.className}>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  )
}

