import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { PageTitleProvider } from '@spoon/shared/Context/page-title-context'
import { UserProvider } from '@spoon/shared/Context/user-context'
import { NotificationProvider } from '@spoon/shared/Context/notification-provider'

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
        <UserProvider>
          <PageTitleProvider>
            <NotificationProvider>
              {children}
            </NotificationProvider>
          </PageTitleProvider>
        </UserProvider>
      </body>
    </html>
  )
}