"use client"

import { useState, useEffect } from "react"
import { useSignUp } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, XCircle, Mail } from "lucide-react"
import AuthLayout from "./auth-layout"

export default function EmailVerification() {
  const router = useRouter();
  const { isLoaded, signUp, setActive } = useSignUp();
  const [verificationCode, setVerificationCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    // Get the email from session storage
    const pendingSignUp = sessionStorage.getItem('pendingSignUp');
    if (pendingSignUp) {
      const { email } = JSON.parse(pendingSignUp);
      setEmail(email);
    } else {
      // If no pending signup, redirect to signup page
      router.push("/auth/signup");
    }
  }, [router]);

  const handleVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;

    setIsLoading(true);
    setError("");

    try {
      const result = await signUp.attemptEmailAddressVerification({
        code: verificationCode,
      });

      if (result.status === "complete") {
        // Clear the pending signup from session storage
        sessionStorage.removeItem('pendingSignUp');
        // Set the session as active
        await setActive({ session: result.createdSessionId });
        // Redirect to dashboard
        router.push("/dashboard");
      } else {
        console.log("Verification not complete:", result);
      }
    } catch (error: any) {
      console.error('Verification error:', error);
      setError("Invalid verification code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!isLoaded) return;

    try {
      await signUp.prepareEmailAddressVerification();
      setError("");
    } catch (error) {
      console.error('Error resending code:', error);
      setError("Failed to resend verification code. Please try again.");
    }
  };

  return (
    <AuthLayout>
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Verify your email</CardTitle>
          <CardDescription className="text-center">
            We've sent a verification code to {email}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleVerification} className="space-y-4">
            <div className="space-y-2">
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Enter verification code"
                  className="pl-10"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>

            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify Email"
              )}
            </Button>
          </form>
        </CardContent>

        <CardFooter>
          <div className="text-center text-sm text-gray-600 dark:text-gray-400 w-full">
            Didn't receive the code?{" "}
            <button
              onClick={handleResendCode}
              className="text-emerald-600 hover:underline font-medium"
              disabled={isLoading}
            >
              Resend code
            </button>
          </div>
        </CardFooter>
      </Card>
    </AuthLayout>
  )
}
