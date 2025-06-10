"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle, Settings, RefreshCw, ArrowLeft, Clock, DollarSign, Shield } from "lucide-react"
import { useState } from "react"

export function WithdrawalFailurePage() {
  const [isChecking, setIsChecking] = useState(false)

  const handleCheckStatus = () => {
    setIsChecking(true)
    setTimeout(() => {
      setIsChecking(false)
    }, 2000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-yellow-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Warning Banner */}
        <Alert className="mb-6 border-amber-200 bg-amber-50 shadow-lg">
          <AlertTriangle className="h-5 w-5 text-amber-600" />
          <AlertDescription className="text-amber-800 font-medium">
            <strong>Withdrawal Failed:</strong> We're having trouble processing your payout
          </AlertDescription>
        </Alert>

        {/* Main Content */}
        <Card className="border-0 shadow-xl bg-white/95 backdrop-blur-sm">
          <CardContent className="p-8 lg:p-10 text-center">
            {/* Warning Icon */}
            <div className="mb-6">
              <div className="mx-auto w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mb-4 shadow-lg">
                <AlertTriangle className="h-10 w-10 text-amber-600" />
              </div>
            </div>

            {/* Error Message */}
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-3">Withdrawal Failed</h1>
            <p className="text-gray-600 mb-6 leading-relaxed">
              We're unable to process your payout request right now. Your funds remain secure in your account.
            </p>

            {/* Account Balance */}
            <div className="bg-emerald-50 rounded-lg p-4 mb-6 border border-emerald-200">
              <div className="flex items-center justify-center gap-2 mb-2">
                <DollarSign className="h-5 w-5 text-emerald-600" />
                <span className="text-sm text-emerald-700 font-medium">Available Balance</span>
              </div>
              <div className="text-2xl font-bold text-emerald-800">$2,847.50</div>
              <div className="flex items-center justify-center gap-1 mt-2 text-xs text-emerald-600">
                <Shield className="h-3 w-3" />
                <span>Your funds are secure</span>
              </div>
            </div>

            {/* Error Details */}
            <Alert className="mb-6 border-red-200 bg-red-50">
              <Clock className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                <strong>Issue:</strong> Bank account verification failed
                <br />
                <strong>Error Code:</strong> BANK_DETAILS_INVALID
              </AlertDescription>
            </Alert>

            {/* Guidance */}
            <div className="text-left bg-blue-50 rounded-lg p-4 mb-6">
              <h3 className="font-medium text-blue-900 mb-2">What to check:</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Verify your bank account details are correct</li>
                <li>• Ensure your account is active and in good standing</li>
                <li>• Check if your bank accepts international transfers</li>
                <li>• Contact your bank if you're unsure about any restrictions</li>
              </ul>
            </div>

            {/* Withdrawal Details */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-600">Withdrawal Amount:</span>
                <span className="font-medium text-gray-900">$500.00</span>
              </div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-600">Destination:</span>
                <span className="font-medium text-gray-900">Bank Account ****1234</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Attempted:</span>
                <span className="font-medium text-gray-900">{new Date().toLocaleDateString()}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button asChild className="w-full bg-emerald-600 hover:bg-emerald-700" size="lg">
                <a href="/dashboard/payout-settings">
                  <Settings className="h-4 w-4 mr-2" />
                  Review Payout Settings
                </a>
              </Button>

              <Button onClick={handleCheckStatus} disabled={isChecking} variant="outline" className="w-full" size="lg">
                {isChecking ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Checking...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Check Status
                  </>
                )}
              </Button>

              <Button variant="ghost" className="w-full text-gray-600" size="lg">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </div>

            {/* Help Text */}
            <div className="mt-6 text-sm text-gray-500">
              <p>
                Questions about withdrawals?{" "}
                <a href="/help" className="text-emerald-600 hover:text-emerald-700 underline">
                  View our withdrawal guide
                </a>{" "}
                or{" "}
                <a href="/contact" className="text-emerald-600 hover:text-emerald-700 underline">
                  contact support
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
