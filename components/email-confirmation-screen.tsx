"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Mail, CheckCircle, Clock } from "lucide-react"

export function EmailConfirmationScreen() {
  const [isResending, setIsResending] = useState(false)
  const [resent, setResent] = useState(false)

  const handleResend = async () => {
    setIsResending(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setIsResending(false)
    setResent(true)
    setTimeout(() => setResent(false), 3000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-0 shadow-2xl">
        <CardContent className="p-8 text-center">
          {/* Icon */}
          <div className="mb-6">
            <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
              <Mail className="h-8 w-8 text-emerald-600" />
            </div>
            <div className="w-2 h-2 bg-emerald-500 rounded-full mx-auto animate-pulse"></div>
          </div>

          {/* Content */}
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Check Your Email</h1>
          <p className="text-gray-600 mb-6 leading-relaxed">
            We've sent a confirmation link to your email address. Please click the link to verify your account and
            complete your registration.
          </p>

          {/* Email Address */}
          <div className="bg-gray-50 rounded-lg p-3 mb-6">
            <p className="text-sm text-gray-500">Email sent to:</p>
            <p className="font-medium text-gray-900">john.doe@example.com</p>
          </div>

          {/* Resend Button */}
          <Button
            onClick={handleResend}
            disabled={isResending}
            variant="outline"
            className="w-full mb-4 hover:bg-emerald-50 hover:border-emerald-300"
          >
            {isResending ? (
              <>
                <Clock className="h-4 w-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : resent ? (
              <>
                <CheckCircle className="h-4 w-4 mr-2 text-emerald-600" />
                Email Sent!
              </>
            ) : (
              "Resend Confirmation Email"
            )}
          </Button>

          {/* Help Text */}
          <div className="text-sm text-gray-500 space-y-2">
            <p>Didn't receive the email? Check your spam folder.</p>
            <p>
              Need help?{" "}
              <a href="/contact" className="text-emerald-600 hover:text-emerald-700 underline">
                Contact Support
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
