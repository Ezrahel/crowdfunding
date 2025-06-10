"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Mail, AlertTriangle, Loader2, RefreshCw, ArrowLeft, Shield } from "lucide-react"

interface EmailNotVerifiedProps {
  userEmail?: string
  redirectUrl?: string
}

export default function EmailNotVerified({
  userEmail = "user@example.com",
  redirectUrl = "/dashboard",
}: EmailNotVerifiedProps) {
  const [isResending, setIsResending] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)

  const handleResendEmail = async () => {
    setIsResending(true)
    setResendSuccess(false)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))
      setResendSuccess(true)
    } catch (error) {
      // Handle error
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          <CardHeader className="text-center space-y-4 pb-2">
            {/* Animated Warning Icon */}
            <div className="mx-auto w-20 h-20 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-red-400 opacity-20 animate-pulse" />
              <AlertTriangle className="w-10 h-10 text-orange-600 dark:text-orange-400 animate-bounce" />

              {/* Floating email icons */}
              <div className="absolute inset-0 pointer-events-none">
                <Mail
                  className="absolute w-4 h-4 text-orange-400 animate-float-1"
                  style={{ top: "10%", left: "20%" }}
                />
                <Mail className="absolute w-3 h-3 text-red-400 animate-float-2" style={{ top: "70%", right: "15%" }} />
                <Mail
                  className="absolute w-4 h-4 text-orange-300 animate-float-3"
                  style={{ bottom: "20%", left: "10%" }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">Email Not Verified</CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                Please verify your email address to continue
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <Alert className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-900/20">
              <Shield className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-800 dark:text-orange-200">
                For security reasons, you need to verify your email address before accessing this feature.
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <div className="text-center space-y-2">
                <p className="text-sm text-gray-600 dark:text-gray-400">We sent a verification email to:</p>
                <p className="font-medium text-gray-900 dark:text-gray-100 bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-lg">
                  {userEmail}
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium text-gray-900 dark:text-gray-100">Didn't receive the email?</h4>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <li className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-orange-400 rounded-full" />
                    <span>Check your spam or junk folder</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-orange-400 rounded-full" />
                    <span>Make sure the email address is correct</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-orange-400 rounded-full" />
                    <span>Wait a few minutes for delivery</span>
                  </li>
                </ul>
              </div>

              {resendSuccess && (
                <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20">
                  <Mail className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800 dark:text-green-200">
                    Verification email sent successfully! Please check your inbox.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>

          <CardFooter className="space-y-3">
            <Button
              onClick={handleResendEmail}
              disabled={isResending}
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
            >
              {isResending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending Email...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Resend Verification Email
                </>
              )}
            </Button>

            <div className="flex space-x-2 w-full">
              <Link href="/auth/login" className="flex-1">
                <Button variant="outline" className="w-full">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Login
                </Button>
              </Link>
              <Link href="/auth/signup" className="flex-1">
                <Button variant="ghost" className="w-full">
                  Update Email
                </Button>
              </Link>
            </div>
          </CardFooter>
        </Card>

        {/* Help text */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Need help?{" "}
            <Link
              href="/contact"
              className="text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300 font-medium"
            >
              Contact Support
            </Link>
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes float-1 {
          0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.7; }
          50% { transform: translateY(-10px) rotate(5deg); opacity: 1; }
        }
        @keyframes float-2 {
          0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.5; }
          50% { transform: translateY(-15px) rotate(-5deg); opacity: 0.9; }
        }
        @keyframes float-3 {
          0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.6; }
          50% { transform: translateY(-8px) rotate(3deg); opacity: 1; }
        }
        .animate-float-1 { animation: float-1 3s ease-in-out infinite; }
        .animate-float-2 { animation: float-2 4s ease-in-out infinite 0.5s; }
        .animate-float-3 { animation: float-3 3.5s ease-in-out infinite 1s; }
      `}</style>
    </div>
  )
}
