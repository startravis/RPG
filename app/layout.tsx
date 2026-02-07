import React from "react"
import type { Metadata, Viewport } from 'next'
import { Inter, Cinzel } from 'next/font/google'
import { ThemeProvider } from '@/components/theme-provider'

import './globals.css'

const _inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const _cinzel = Cinzel({ subsets: ['latin'], variable: '--font-cinzel' })

export const metadata: Metadata = {
  title: 'P.O.W.E.R',
  description: 'Rastreador animado de stats para RPG de mesa - Vida, Mentalidade e Energia Amaldicoada',
}

export const viewport: Viewport = {
  themeColor: '#0f0f17',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${_inter.variable} ${_cinzel.variable} font-sans antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
