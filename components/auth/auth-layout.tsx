"use client"

import type React from "react"

import Link from "next/link"
import { Heart, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

interface AuthLayoutProps {
  children: React.ReactNode
  showBackButton?: boolean
  backHref?: string
}

export default function AuthLayout({ children, showBackButton = false, backHref = "/" }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex flex-col">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5 dark:opacity-10" />

      {/* Header */}
      <header className="relative z-10 p-6">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
              <Heart className="w-5 h-5 text-white fill-current" />
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">FundRaise</span>
          </Link>

          {showBackButton && (
            <Link href={backHref}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-6 relative z-10">
        <div className="w-full max-w-md">{children}</div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 p-6 text-center text-sm text-gray-600 dark:text-gray-400">
        <p>
          © 2025 FundRaise. Made with <Heart className="inline w-4 h-4 text-red-500 fill-current" /> for changemakers
          worldwide.
        </p>
        <div className="mt-2 space-x-4">
          <Link href="/privacy" className="hover:text-emerald-600 transition-colors">
            Privacy Policy
          </Link>
          <Link href="/terms" className="hover:text-emerald-600 transition-colors">
            Terms of Service
          </Link>
          <Link href="/help" className="hover:text-emerald-600 transition-colors">
            Help Center
          </Link>
        </div>
      </footer>
    </div>
  )
}
