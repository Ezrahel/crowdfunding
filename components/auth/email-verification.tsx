"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Mail, CheckCircle, Loader2, XCircle, RefreshCw, Clock } from "lucide-react"
import AuthLayout from "./auth-layout"

interface EmailVerificationProps {
  token: string
}

type VerificationStatus = "verifying" | "success" | "expired" | "invalid" | "already-verified"

export default function EmailVerification({ token }: EmailVerificationProps) {
  const [status, setStatus] = useState<VerificationStatus>("verifying")
  const [isResending, setIsResending] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)
  const [userEmail, setUserEmail] = useState("user@example.com")

  useEffect(() => {
    // Auto-verify on component mount
    const verifyEmail = async () => {
      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 2000))

        // Simulate different verification outcomes
        const outcomes: VerificationStatus[] = ["success", "expired", "invalid", "already-verified"]
        const weights = [0.7, 0.1, 0.1, 0.1] // 70% success rate

        const random = Math.random()
        let cumulativeWeight = 0
        let selectedStatus: VerificationStatus = "success"

        for (let i = 0; i < outcomes.length; i++) {
          cumulativeWeight += weights[i]
          if (random <= cumulativeWeight) {
            selectedStatus = outcomes[i]
            break
          }
        }

        setStatus(selectedStatus)
      } catch (error) {
        setStatus("invalid")
      }
    }

    if (token !== "pending") {
      verifyEmail()
    } else {
      setStatus("success") // For pending state from signup
    }
  }, [token])

  useEffect(() => {
    // Countdown timer for resend cooldown
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [resendCooldown])

  const handleResendEmail = async () => {
    setIsResending(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))
      setResendCooldown(60) // 60 second cooldown
    } catch (error) {
      // Handle error
    } finally {
      setIsResending(false)
    }
  }

  const handleManualVerify = async () => {
    setStatus("verifying")

    try {
      // Simulate manual verification
      await new Promise((resolve) => setTimeout(resolve, 1500))
      setStatus("success")
    } catch (error) {
      setStatus("invalid")
    }
  }

  if (status === "verifying") {
    return (
      <AuthLayout>
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12 space-y-4">
            <div className="relative">
              <Mail className="w-12 h-12 text-emerald-600 animate-pulse" />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full animate-ping" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="font-semibold">Verifying your email...</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Please wait while we confirm your email address
              </p>
            </div>
          </CardContent>
        </Card>
      </AuthLayout>
    )
  }

  if (status === "success") {
    return (
      <AuthLayout>
        <Card className="w-full max-w-md">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center relative">
              <CheckCircle className="w-8 h-8 text-emerald-600" />
              {/* Confetti animation */}
              <div className="absolute inset-0 pointer-events-none">
                {[...Array(8)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-2 h-2 bg-emerald-400 rounded-full animate-bounce"
                    style={{
                      left: `${20 + i * 10}%`,
                      top: `${20 + (i % 3) * 20}%`,
                      animationDelay: `${i * 0.1}s`,
                      animationDuration: "1s",
                    }}
                  />
                ))}
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">Email Verified!</CardTitle>
            <CardDescription>
              {token === "pending"
                ? "Thank you for signing up! Please check your inbox to verify your email address."
                : "Your email address has been successfully verified. Welcome to FundRaise!"}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                {token === "pending"
                  ? `We've sent a verification email to ${userEmail}. Click the link in the email to activate your account.`
                  : "Your account is now fully activated and ready to use."}
              </AlertDescription>
            </Alert>

            {token === "pending" && (
              <div className="space-y-3">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <p>Didn't receive the email?</p>
                  <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
                    <li>Check your spam or junk folder</li>
                    <li>Make sure you entered the correct email</li>
                    <li>Wait a few minutes for delivery</li>
                  </ul>
                </div>

                <Button
                  onClick={handleResendEmail}
                  disabled={isResending || resendCooldown > 0}
                  variant="outline"
                  className="w-full"
                >
                  {isResending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : resendCooldown > 0 ? (
                    <>
                      <Clock className="mr-2 h-4 w-4" />
                      Resend in {resendCooldown}s
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Resend Email
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>

          <CardFooter>
            {token === "pending" ? (
              <Link href="/auth/login" className="w-full">
                <Button variant="ghost" className="w-full">
                  Back to Sign In
                </Button>
              </Link>
            ) : (
              <Link href="/dashboard" className="w-full">
                <Button className="w-full">Continue to Dashboard</Button>
              </Link>
            )}
          </CardFooter>
        </Card>
      </AuthLayout>
    )
  }

  if (status === "already-verified") {
    return (
      <AuthLayout>
        <Card className="w-full max-w-md">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-blue-600" />
            </div>
            <CardTitle className="text-2xl font-bold">Already Verified</CardTitle>
            <CardDescription>
              This email address has already been verified. You can sign in to your account.
            </CardDescription>
          </CardHeader>

          <CardFooter>
            <Link href="/auth/login" className="w-full">
              <Button className="w-full">Continue to Sign In</Button>
            </Link>
          </CardFooter>
        </Card>
      </AuthLayout>
    )
  }

  // Expired or Invalid states
  return (
    <AuthLayout>
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
            {status === "expired" ? (
              <Clock className="w-8 h-8 text-red-600" />
            ) : (
              <XCircle className="w-8 h-8 text-red-600" />
            )}
          </div>
          <CardTitle className="text-2xl font-bold">{status === "expired" ? "Link Expired" : "Invalid Link"}</CardTitle>
          <CardDescription>
            {status === "expired"
              ? "This verification link has expired. Please request a new one."
              : "This verification link is invalid or has already been used."}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>
              {status === "expired"
                ? "Verification links expire after 24 hours for security reasons."
                : "The verification link may be corrupted or already used."}
            </AlertDescription>
          </Alert>

          <Button onClick={handleManualVerify} variant="outline" className="w-full">
            Try Manual Verification
          </Button>
        </CardContent>

        <CardFooter className="space-y-2">
          <Button onClick={handleResendEmail} disabled={isResending || resendCooldown > 0} className="w-full">
            {isResending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending New Link...
              </>
            ) : resendCooldown > 0 ? (
              <>
                <Clock className="mr-2 h-4 w-4" />
                Resend in {resendCooldown}s
              </>
            ) : (
              "Send New Verification Link"
            )}
          </Button>
          <Link href="/auth/login" className="w-full">
            <Button variant="ghost" className="w-full">
              Back to Sign In
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </AuthLayout>
  )
}
