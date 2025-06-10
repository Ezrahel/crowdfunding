"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { RefreshCw, ArrowLeft, MessageCircle, AlertTriangle } from "lucide-react"
import { useState } from "react"

export function GenericErrorPage() {
  const [isRetrying, setIsRetrying] = useState(false)

  const handleRetry = () => {
    setIsRetrying(true)
    // Simulate retry delay
    setTimeout(() => {
      setIsRetrying(false)
      window.location.reload()
    }, 1500)
  }

  const handleGoBack = () => {
    window.history.back()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg text-center">
        {/* Sad Face Illustration */}
        <div className="mb-8">
          <div className="mx-auto w-32 h-32 lg:w-40 lg:h-40 bg-gradient-to-br from-red-100 to-orange-100 rounded-full flex items-center justify-center mb-6 shadow-lg">
            <div className="text-6xl lg:text-7xl animate-pulse">😞</div>
          </div>
        </div>

        {/* Content */}
        <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
          <CardContent className="p-8 lg:p-10">
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Something Went Wrong</h1>
            <p className="text-lg text-gray-600 mb-6 leading-relaxed">
              We encountered an unexpected error. This isn't your fault – our team has been notified and is working on a
              fix.
            </p>

            {/* Error Details */}
            <Alert className="mb-6 border-amber-200 bg-amber-50">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800">
                <strong>Error ID:</strong> ERR_500_INTERNAL
                <br />
                <strong>Time:</strong> {new Date().toLocaleString()}
              </AlertDescription>
            </Alert>

            {/* What to try */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
              <h3 className="font-medium text-gray-900 mb-2">What you can try:</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Refresh the page or try again in a few minutes</li>
                <li>• Check your internet connection</li>
                <li>• Clear your browser cache and cookies</li>
                <li>• Try using a different browser</li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                onClick={handleRetry}
                disabled={isRetrying}
                className="w-full bg-emerald-600 hover:bg-emerald-700"
                size="lg"
              >
                {isRetrying ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Retrying...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Try Again
                  </>
                )}
              </Button>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button onClick={handleGoBack} variant="outline" className="flex-1" size="lg">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Go Back
                </Button>

                <Button asChild variant="outline" className="flex-1" size="lg">
                  <a href="/contact">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Contact Support
                  </a>
                </Button>
              </div>
            </div>

            {/* Help Text */}
            <div className="mt-6 text-sm text-gray-500">
              <p>
                If this problem persists, please{" "}
                <a href="/contact" className="text-emerald-600 hover:text-emerald-700 underline">
                  contact our support team
                </a>{" "}
                with the error ID above.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
