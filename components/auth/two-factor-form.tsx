"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Shield, Smartphone, Mail, RefreshCw, ArrowLeft, Loader2, XCircle, Clock } from "lucide-react"
import AuthLayout from "./auth-layout"

type AuthMethod = "app" | "sms" | "email"

export default function TwoFactorForm() {
  const [code, setCode] = useState(["", "", "", "", "", ""])
  const [activeMethod, setActiveMethod] = useState<AuthMethod>("app")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [timeLeft, setTimeLeft] = useState(30)
  const [canResend, setCanResend] = useState(false)
  const [isResending, setIsResending] = useState(false)

  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    // Countdown timer
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else {
      setCanResend(true)
    }
  }, [timeLeft])

  useEffect(() => {
    // Auto-submit when all fields are filled
    if (code.every((digit) => digit !== "")) {
      handleSubmit()
    }
  }, [code])

  const handleInputChange = (index: number, value: string) => {
    if (value.length > 1) return // Prevent multiple characters

    const newCode = [...code]
    newCode[index] = value
    setCode(newCode)

    // Move to next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }

    // Clear error when user starts typing
    if (error) setError("")
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6)
    const newCode = [...code]

    for (let i = 0; i < pastedData.length; i++) {
      newCode[i] = pastedData[i]
    }

    setCode(newCode)

    // Focus the next empty input or the last one
    const nextEmptyIndex = newCode.findIndex((digit) => digit === "")
    const focusIndex = nextEmptyIndex === -1 ? 5 : nextEmptyIndex
    inputRefs.current[focusIndex]?.focus()
  }

  const handleSubmit = async () => {
    const fullCode = code.join("")
    if (fullCode.length !== 6) {
      setError("Please enter the complete 6-digit code")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Simulate verification (90% success rate)
      if (Math.random() > 0.1) {
        window.location.href = "/dashboard"
      } else {
        setError("Invalid code. Please try again.")
        setCode(["", "", "", "", "", ""])
        inputRefs.current[0]?.focus()
      }
    } catch (error) {
      setError("Something went wrong. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendCode = async () => {
    setIsResending(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setTimeLeft(30)
      setCanResend(false)
      setError("")
    } catch (error) {
      setError("Failed to resend code. Please try again.")
    } finally {
      setIsResending(false)
    }
  }

  const handleMethodChange = (method: AuthMethod) => {
    setActiveMethod(method)
    setCode(["", "", "", "", "", ""])
    setError("")
    setTimeLeft(30)
    setCanResend(false)
    inputRefs.current[0]?.focus()
  }

  const getMethodInfo = (method: AuthMethod) => {
    switch (method) {
      case "app":
        return {
          icon: <Shield className="w-5 h-5" />,
          title: "Authenticator App",
          description: "Enter the 6-digit code from your authenticator app",
          contact: "Google Authenticator, Authy, etc.",
        }
      case "sms":
        return {
          icon: <Smartphone className="w-5 h-5" />,
          title: "Text Message",
          description: "Enter the code sent to your phone",
          contact: "+1 (***) ***-1234",
        }
      case "email":
        return {
          icon: <Mail className="w-5 h-5" />,
          title: "Email",
          description: "Enter the code sent to your email",
          contact: "user@example.com",
        }
    }
  }

  const currentMethod = getMethodInfo(activeMethod)

  return (
    <AuthLayout>
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
            {currentMethod.icon}
          </div>
          <CardTitle className="text-2xl font-bold">Two-Factor Authentication</CardTitle>
          <CardDescription>{currentMethod.description}</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Method Selector */}
          <div className="flex space-x-2">
            {(["app", "sms", "email"] as AuthMethod[]).map((method) => {
              const methodInfo = getMethodInfo(method)
              return (
                <button
                  key={method}
                  onClick={() => handleMethodChange(method)}
                  className={`flex-1 p-3 rounded-lg border text-center transition-colors ${
                    activeMethod === method
                      ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300"
                      : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                  }`}
                >
                  <div className="flex flex-col items-center space-y-1">
                    {methodInfo.icon}
                    <span className="text-xs font-medium">{methodInfo.title}</span>
                  </div>
                </button>
              )
            })}
          </div>

          {/* Code Input */}
          <div className="space-y-4">
            <div className="flex justify-center space-x-2">
              {code.map((digit, index) => (
                <Input
                  key={index}
                  ref={(el) => { inputRefs.current[index] = el }}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  className="w-12 h-12 text-center text-lg font-semibold"
                  disabled={isLoading}
                />
              ))}
            </div>

            <div className="text-center text-sm text-gray-600 dark:text-gray-400">
              <p>Code sent to {currentMethod.contact}</p>
              {timeLeft > 0 ? (
                <p className="flex items-center justify-center mt-2">
                  <Clock className="w-4 h-4 mr-1" />
                  Code expires in {timeLeft}s
                </p>
              ) : (
                <p className="text-red-600 dark:text-red-400 mt-2">Code expired</p>
              )}
            </div>
          </div>

          {/* Resend Code */}
          <div className="text-center">
            <Button onClick={handleResendCode} disabled={!canResend || isResending} variant="ghost" size="sm">
              {isResending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Resend Code
                </>
              )}
            </Button>
          </div>

          {/* Manual Submit Button */}
          <Button onClick={handleSubmit} disabled={isLoading || code.some((digit) => digit === "")} className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : (
              "Verify Code"
            )}
          </Button>
        </CardContent>

        <CardFooter>
          <Link href="/auth/login" className="w-full">
            <Button variant="ghost" className="w-full">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Sign In
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </AuthLayout>
  )
}
