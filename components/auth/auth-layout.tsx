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
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex flex-col relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-teal-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80908012_1px,transparent_1px),linear-gradient(to_bottom,#80908012_1px,transparent_1px)] bg-[size:24px_24px] opacity-20" />

      {/* Header */}
      <header className="relative z-10 p-6">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
              <Heart className="w-6 h-6 text-white fill-current" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              FundRaise
            </span>
          </Link>

          {showBackButton && (
            <Link href={backHref}>
              <Button variant="ghost" size="sm" className="hover:bg-emerald-50">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-6 relative z-10">
        <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 p-6 text-center text-sm text-gray-600 dark:text-gray-400">
        <p className="flex items-center justify-center gap-1">
          © 2025 FundRaise. Made with <Heart className="w-4 h-4 text-red-500 fill-current animate-pulse" /> for changemakers
          worldwide.
        </p>
        <div className="mt-3 space-x-4">
          <Link href="/privacy" className="hover:text-emerald-600 transition-colors font-medium">
            Privacy Policy
          </Link>
          <span className="text-gray-300">•</span>
          <Link href="/terms" className="hover:text-emerald-600 transition-colors font-medium">
            Terms of Service
          </Link>
          <span className="text-gray-300">•</span>
          <Link href="/help" className="hover:text-emerald-600 transition-colors font-medium">
            Help Center
          </Link>
        </div>
      </footer>

      <style jsx>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  )
}
