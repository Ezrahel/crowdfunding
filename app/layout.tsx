import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Navigation } from "@/components/navigation"
import { AuthModalsProvider } from "@/components/auth/auth-modals"
import { ConditionalFooter } from "@/components/conditionalFooter"
import { ClerkProvider } from '@clerk/nextjs'

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "FundRaise - Start Your Fundraising Campaign",
  description: "Help others achieve their goals through crowdfunding",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <AuthModalsProvider>
          <Navigation />
          <main className="min-h-screen">{children}</main>
          <ConditionalFooter />
        </AuthModalsProvider>
      </body>
    </html>
    </ClerkProvider>
  )
}
