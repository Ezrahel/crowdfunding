"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Home, Search, HelpCircle } from "lucide-react"
import Link from "next/link"

export function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl text-center">
        {/* Enhanced Illustration */}
        <div className="mb-8">
          <div className="mx-auto w-48 h-48 lg:w-64 lg:h-64 bg-gradient-to-br from-blue-100 to-emerald-100 rounded-full flex items-center justify-center mb-6 shadow-lg animate-not-found-float">
            <div className="relative">
              {/* Confused character illustration */}
              <div className="w-24 h-24 lg:w-32 lg:h-32 bg-white rounded-full flex items-center justify-center shadow-md animate-confused-wobble">
                <div className="text-4xl lg:text-5xl">🤔</div>
              </div>
              {/* Question marks floating around */}
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-200 rounded-full flex items-center justify-center text-blue-600 animate-question-float">
                <HelpCircle className="h-4 w-4" />
              </div>
              <div className="absolute -bottom-1 -left-3 w-6 h-6 bg-emerald-200 rounded-full flex items-center justify-center text-emerald-600 animate-question-float-delayed">
                <span className="text-xs">?</span>
              </div>
              <div className="absolute top-1/2 -right-6 w-5 h-5 bg-purple-200 rounded-full flex items-center justify-center text-purple-600 animate-question-float">
                <span className="text-xs">?</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardContent className="p-8 lg:p-12">
            <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-4">404</h1>
            <h2 className="text-2xl lg:text-3xl font-semibold text-gray-800 mb-4">Oops! We can't find that page</h2>
            <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto leading-relaxed">
              The page you're looking for might have been moved, deleted, or the link might be broken. Don't worry, it
              happens to the best of us!
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button asChild size="lg" className="bg-emerald-600 hover:bg-emerald-700 px-8">
                <Link href="/">
                  <Home className="h-5 w-5 mr-2" />
                  Go Back Home
                </Link>
              </Button>

              <Button asChild variant="outline" size="lg" className="px-8">
                <Link href="/explore">
                  <Search className="h-5 w-5 mr-2" />
                  Explore Fundraisers
                </Link>
              </Button>
            </div>

            {/* Additional Help */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500 mb-3">Still having trouble? We're here to help!</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center items-center text-sm">
                <Link href="/contact" className="text-emerald-600 hover:text-emerald-700 underline">
                  Contact Support
                </Link>
                <span className="hidden sm:inline text-gray-300">•</span>
                <Link href="/help" className="text-emerald-600 hover:text-emerald-700 underline">
                  Help Center
                </Link>
                <span className="hidden sm:inline text-gray-300">•</span>
                <Link href="/faq" className="text-emerald-600 hover:text-emerald-700 underline">
                  FAQ
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
