"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, XCircle, Mail, CheckCircle2 } from "lucide-react"
import AuthLayout from "./auth-layout"

export default function EmailVerification() {
  const router = useRouter()
  const { user, sendVerificationEmail } = useAuth()
  const [verificationCode, setVerificationCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)

  useEffect(() => {
    if (!user) {
      router.push("/auth/signup")
      return
    }

    // If email is already verified, redirect to onboarding
    if (user.emailVerified) {
      router.push("/onboarding")
    }
  }, [user, router])

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendCooldown])

  const handleResendCode = async () => {
    if (resendCooldown > 0) return

    try {
      await sendVerificationEmail()
      setResendCooldown(60)
      setError("")
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err: any) {
      console.error('Error resending code:', err)
      setError("Failed to resend verification email. Please try again.")
    }
  }

  if (!user) {
    return null
  }

  return (
    <AuthLayout>
      <Card className="w-full max-w-md shadow-xl border-0 bg-white/95 backdrop-blur-sm">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
            <Mail className="h-8 w-8 text-emerald-600" />
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
            Verify your email
          </CardTitle>
          <CardDescription className="text-base pt-2">
            We've sent a verification link to
            <br />
            <span className="font-semibold text-gray-900">{user.email}</span>
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive" className="border-red-200 bg-red-50">
            <XCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
          </Alert>
          )}

          {success && (
            <Alert className="border-emerald-200 bg-emerald-50">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <AlertDescription className="text-emerald-800">
                Verification email sent! Please check your inbox.
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-4 text-center">
            <p className="text-sm text-gray-600">
              Click the verification link in the email we sent to verify your account.
            </p>
            <p className="text-sm text-gray-600">
              After verification, you'll be able to access all features of FundRaise.
            </p>
            </div>

          <div className="pt-4 border-t">
            <Button
              onClick={handleResendCode}
              disabled={resendCooldown > 0 || isLoading}
              variant="outline"
              className="w-full h-11"
            >
              {resendCooldown > 0 ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Resend in {resendCooldown}s
              </>
            ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Resend verification email
                </>
            )}
            </Button>
          </div>
        </CardContent>

        <CardFooter className="border-t pt-6">
          <div className="text-center text-sm text-gray-600 dark:text-gray-400 w-full">
            Already verified?{" "}
            <Button
              variant="link"
              onClick={() => router.push("/dashboard")}
              className="text-emerald-600 hover:text-emerald-700 hover:underline font-semibold p-0 h-auto"
            >
              Go to Dashboard
            </Button>
          </div>
        </CardFooter>
      </Card>
    </AuthLayout>
  )
}
