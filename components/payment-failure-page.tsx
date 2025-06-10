"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { XCircle, RefreshCw, CreditCard, ArrowLeft, AlertTriangle, Shield } from "lucide-react"
import { useState } from "react"

export function PaymentFailurePage() {
  const [isRetrying, setIsRetrying] = useState(false)

  const handleRetryPayment = () => {
    setIsRetrying(true)
    // Simulate retry delay
    setTimeout(() => {
      setIsRetrying(false)
      // Navigate back to payment form
      console.log("Retrying payment...")
    }, 2000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Warning Banner */}
        <Alert className="mb-6 border-red-200 bg-red-50 shadow-lg">
          <XCircle className="h-5 w-5 text-red-600" />
          <AlertDescription className="text-red-800 font-medium">
            <strong>Payment Failed:</strong> We couldn't complete your donation
          </AlertDescription>
        </Alert>

        {/* Main Content */}
        <Card className="border-0 shadow-xl bg-white/95 backdrop-blur-sm">
          <CardContent className="p-8 lg:p-10 text-center">
            {/* Error Icon */}
            <div className="mb-6">
              <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-4 shadow-lg">
                <XCircle className="h-10 w-10 text-red-600" />
              </div>
            </div>

            {/* Error Message */}
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-3">We couldn't complete your donation</h1>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Don't worry – your card wasn't charged. Let's try to resolve this issue together.
            </p>

            {/* Campaign Info */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Campaign:</span>
                <span className="font-medium text-gray-900">Help Build Clean Water Wells</span>
              </div>
              <div className="flex items-center justify-between text-sm mt-2">
                <span className="text-gray-600">Amount:</span>
                <span className="font-medium text-gray-900">$50.00</span>
              </div>
            </div>

            {/* Error Details */}
            <Alert className="mb-6 border-amber-200 bg-amber-50">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800">
                <strong>Reason:</strong> Your card was declined by your bank
                <br />
                <strong>Error Code:</strong> CARD_DECLINED
              </AlertDescription>
            </Alert>

            {/* Security Assurance */}
            <div className="flex items-center justify-center gap-2 text-sm text-gray-600 mb-6">
              <Shield className="h-4 w-4 text-emerald-600" />
              <span>Your payment information is secure and encrypted</span>
            </div>

            {/* Suggested Actions */}
            <div className="text-left bg-blue-50 rounded-lg p-4 mb-6">
              <h3 className="font-medium text-blue-900 mb-2">What you can try:</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Check your card details and expiry date</li>
                <li>• Ensure you have sufficient funds</li>
                <li>• Try a different payment method</li>
                <li>• Contact your bank if the issue persists</li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                onClick={handleRetryPayment}
                disabled={isRetrying}
                className="w-full bg-emerald-600 hover:bg-emerald-700"
                size="lg"
              >
                {isRetrying ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Retry Payment
                  </>
                )}
              </Button>

              <Button variant="outline" className="w-full" size="lg">
                <CreditCard className="h-4 w-4 mr-2" />
                Use Different Payment Method
              </Button>

              <Button variant="ghost" className="w-full text-gray-600" size="lg">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Campaign
              </Button>
            </div>

            {/* Help Text */}
            <div className="mt-6 text-sm text-gray-500">
              <p>
                Need help?{" "}
                <a href="/contact" className="text-emerald-600 hover:text-emerald-700 underline">
                  Contact our support team
                </a>{" "}
                or call (555) 123-4567
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
