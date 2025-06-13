"use client"
import type { FormEvent } from "react"
import type React from "react"
import axios from "axios"
import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, Mail, Lock, User, Loader2, XCircle } from "lucide-react"
import AuthLayout from "./auth-layout"
import SocialLogin from "./social-login"
import PasswordStrength from "./password-strength"
import { validateEmail, validatePassword, validateName } from "@/lib/auth-validation"
import { useRouter } from 'next/navigation'
import { useSignUp } from "@clerk/nextjs";

interface FormData {
  username: string
  email: string
  password: string
  confirmPassword: string
  acceptTerms: boolean
}

interface FormErrors {
  username?: string
  email?: string
  password?: string
  confirmPassword?: string
  acceptTerms?: string
  general?: string
}

export default function SignupForm() {
  const router = useRouter()
  const { isLoaded, signUp, setActive } = useSignUp()
  const [formData, setFormData] = useState<FormData>({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false,
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [touchedFields, setTouchedFields] = useState<{ [key: string]: boolean }>({})

  const validateField = (field: keyof FormData, value: string | boolean) => {
    let error = ""

    switch (field) {
      case "username":
        const nameValidation = validateName(value as string, "Full name")
        if (!nameValidation.isValid) error = nameValidation.errors[0]
        break
      case "email":
        const emailValidation = validateEmail(value as string)
        if (!emailValidation.isValid) error = emailValidation.errors[0]
        break
      case "password":
        const passwordValidation = validatePassword(value as string)
        if (!passwordValidation.isValid) error = passwordValidation.errors[0]
        break
      case "confirmPassword":
        if (value !== formData.password) error = "Passwords do not match"
        break
      case "acceptTerms":
        if (!(value as boolean)) error = "You must accept the terms and conditions"
        break
    }

    return error
  }

  const validateForm = () => {
    const newErrors: FormErrors = {}

    Object.entries(formData).forEach(([field, value]) => {
      const error = validateField(field as keyof FormData, value)
      if (error) {
        newErrors[field as keyof FormErrors] = error
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))

    // Clear error when field is edited
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }

    // Validate on change if field has been touched
    if (touchedFields[field]) {
      const error = validateField(field, value)
      setErrors((prev) => ({ ...prev, [field]: error || undefined }))
    }
  }

  const handleBlur = (field: keyof FormData) => {
    setTouchedFields((prev) => ({ ...prev, [field]: true }))
    const error = validateField(field, formData[field])
    setErrors((prev) => ({ ...prev, [field]: error || undefined }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsLoading(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Redirect to email verification page
      window.location.href = "/auth/email-not-verified"
    } catch (error) {
      setErrors({ general: "Registration failed. Please try again." })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignup = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    if (!validateForm() || !isLoaded) return;

    setIsLoading(true);

    try {
      const result = await signUp.create({
        emailAddress: formData.email,
        password: formData.password,
        username: formData.username,
      });

      if (result.status === "needs_email_verification") {
        sessionStorage.setItem('pendingSignUp', JSON.stringify({
          email: formData.email,
          username: formData.username
        }));
        router.push("/auth/email-not-verified");
      } else if (result.status === "complete") {
        await result.createdSessionId;
        router.push("/dashboard");
      } else {
        console.log("Sign up not complete:", result);
      }
    } catch (error: any) {
      console.error('Signup error:', error);
      
      if (error.errors) {
        const newErrors: FormErrors = {};
        
        error.errors.forEach((err: any) => {
          if (err.meta?.param_name === 'email_address') {
            newErrors.email = err.message;
          } else if (err.meta?.param_name === 'username') {
            newErrors.username = err.message;
          }
        });
        
        setErrors(Object.keys(newErrors).length > 0 ? newErrors : { 
          general: "Registration failed. Please try again." 
        });
      } else {
        setErrors({ general: "Registration failed. Please try again." });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Create an Account</CardTitle>
          <CardDescription className="text-center">Sign up to start your fundraising journey</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {errors.general && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>{errors.general}</AlertDescription>
            </Alert>
          )}

          <SocialLogin />

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-200 dark:border-gray-700" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white dark:bg-gray-900 px-2 text-gray-500">Or continue with email</span>
            </div>
          </div>

          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="username"
                  type="text"
                  placeholder="Di-Tech"
                  className={`pl-10 ${errors.username ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}`}
                  value={formData.username}
                  onChange={(e) => handleInputChange("username", e.target.value)}
                  onBlur={() => handleBlur("username")}
                  disabled={isLoading}
                />
              </div>
              {errors.username && <p className="text-sm text-red-500">{errors.username}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="di-tech@example.com"
                  className={`pl-10 ${errors.email ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}`}
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  onBlur={() => handleBlur("email")}
                  disabled={isLoading}
                />
              </div>
              {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a secure password"
                  className={`pl-10 pr-10 ${errors.password ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}`}
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  onBlur={() => handleBlur("password")}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
              {formData.password && <PasswordStrength password={formData.password} />}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  className={`pl-10 pr-10 ${errors.confirmPassword ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}`}
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                  onBlur={() => handleBlur("confirmPassword")}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword}</p>}
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="terms"
                name="acceptTerms"
                checked={formData.acceptTerms}
                onCheckedChange={(checked) => handleInputChange("acceptTerms", !!checked)}
              />
              <Label htmlFor="terms" className="text-sm">
                I agree to the{" "}
                <Link href="/terms" className="text-emerald-600 hover:underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-emerald-600 hover:underline">
                  Privacy Policy
                </Link>
              </Label>
            </div>
            {errors.acceptTerms && <p className="text-sm text-red-500">{errors.acceptTerms}</p>}

            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>
        </CardContent>

        <CardFooter>
          <p className="text-center text-sm text-gray-600 dark:text-gray-400 w-full">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-emerald-600 hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </AuthLayout>
  )
}
