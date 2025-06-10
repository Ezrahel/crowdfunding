import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { AuthModalsProvider } from "@/components/auth/auth-modals"

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
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <AuthModalsProvider>
          <Navigation />
          <main className="min-h-screen">{children}</main>
          <Footer />
        </AuthModalsProvider>
      </body>
    </html>
  )
}
