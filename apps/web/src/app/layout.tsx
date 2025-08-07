import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { PageTitleProvider } from '@spoon/shared/Context/page-title-context'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'SPOON Platform',
  description: 'Sistema operativo para restaurantes en Colombia',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <PageTitleProvider>
          {children}
        </PageTitleProvider>
      </body>
    </html>
  )
}