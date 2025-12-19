"use client"
import type { FormEvent } from "react"
import { useState } from "react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
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

interface FormData {
  firstName: string
  lastName: string
  username: string
  email: string
  password: string
  confirmPassword: string
  acceptTerms: boolean
}

interface FormErrors {
  firstName?: string
  lastName?: string
  username?: string
  email?: string
  password?: string
  confirmPassword?: string
  acceptTerms?: string
  general?: string
}

export default function SignupForm() {
  const router = useRouter()
  const { signUp, loading } = useAuth()
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
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
      case "firstName":
      case "lastName":
        const nameValidation = validateName(value as string, field === "firstName" ? "First name" : "Last name")
        if (!nameValidation.isValid) error = nameValidation.errors[0]
        break
      case "username":
        const usernameValidation = validateName(value as string, "Username")
        if (!usernameValidation.isValid) error = usernameValidation.errors[0]
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

  const handleSignup = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    
    if (!validateForm()) return

    setIsLoading(true)
    setErrors({})

    try {
      const displayName = formData.username || `${formData.firstName} ${formData.lastName}`.trim()
      await signUp(formData.email, formData.password, displayName)
      
      // Redirect to email verification page
      router.push("/auth/verify-email")
    } catch (err: any) {
      console.error('Signup error:', err)
      let errorMessage = "Failed to create account. Please try again."
      
      if (err.code === "auth/email-already-in-use") {
        errorMessage = "An account with this email already exists."
      } else if (err.code === "auth/invalid-email") {
        errorMessage = "Invalid email address format."
      } else if (err.code === "auth/weak-password") {
        errorMessage = "Password is too weak. Please choose a stronger password."
      } else if (err.code === "auth/operation-not-allowed") {
        errorMessage = "Email/password accounts are not enabled."
      }
      
      setErrors({ general: errorMessage })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthLayout>
      <Card className="w-full max-w-md shadow-xl border-0 bg-white/95 backdrop-blur-sm">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
            Create an Account
          </CardTitle>
          <CardDescription className="text-base">
            Sign up to start your fundraising journey and make a difference
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5">
          {errors.general && (
            <Alert variant="destructive" className="border-red-200 bg-red-50">
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
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstname" className="text-sm font-medium">First Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    id="firstname"
                    type="text"
                    placeholder="John"
                    className={`pl-10 h-11 ${errors.firstName ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-gray-200"}`}
                    value={formData.firstName}
                    onChange={(e) => handleInputChange("firstName", e.target.value)}
                    onBlur={() => handleBlur("firstName")}
                    disabled={isLoading}
                  />
                </div>
                {errors.firstName && <p className="text-sm text-red-500 mt-1">{errors.firstName}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastname" className="text-sm font-medium">Last Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    id="lastname"
                    type="text"
                    placeholder="Doe"
                    className={`pl-10 h-11 ${errors.lastName ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-gray-200"}`}
                    value={formData.lastName}
                    onChange={(e) => handleInputChange("lastName", e.target.value)}
                    onBlur={() => handleBlur("lastName")}
                    disabled={isLoading}
                  />
                </div>
                {errors.lastName && <p className="text-sm text-red-500 mt-1">{errors.lastName}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-medium">Username</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  id="username"
                  type="text"
                  placeholder="johndoe"
                  className={`pl-10 h-11 ${errors.username ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-gray-200"}`}
                  value={formData.username}
                  onChange={(e) => handleInputChange("username", e.target.value)}
                  onBlur={() => handleBlur("username")}
                  disabled={isLoading}
                />
              </div>
              {errors.username && <p className="text-sm text-red-500 mt-1">{errors.username}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  className={`pl-10 h-11 ${errors.email ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-gray-200"}`}
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  onBlur={() => handleBlur("email")}
                  disabled={isLoading}
                />
              </div>
              {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a secure password"
                  className={`pl-10 pr-10 h-11 ${errors.password ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-gray-200"}`}
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  onBlur={() => handleBlur("password")}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && <p className="text-sm text-red-500 mt-1">{errors.password}</p>}
              {formData.password && <PasswordStrength password={formData.password} />}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  className={`pl-10 pr-10 h-11 ${errors.confirmPassword ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-gray-200"}`}
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                  onBlur={() => handleBlur("confirmPassword")}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 transition-colors"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-sm text-red-500 mt-1">{errors.confirmPassword}</p>}
            </div>

            <div className="flex items-start space-x-2">
              <Checkbox
                id="terms"
                name="acceptTerms"
                checked={formData.acceptTerms}
                onCheckedChange={(checked) => handleInputChange("acceptTerms", !!checked)}
                disabled={isLoading}
                className="mt-1"
              />
              <Label htmlFor="terms" className="text-sm font-normal leading-relaxed cursor-pointer">
                I agree to the{" "}
                <Link href="/terms" className="text-emerald-600 hover:text-emerald-700 hover:underline font-medium">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-emerald-600 hover:text-emerald-700 hover:underline font-medium">
                  Privacy Policy
                </Link>
              </Label>
            </div>
            {errors.acceptTerms && <p className="text-sm text-red-500">{errors.acceptTerms}</p>}

            <Button 
              type="submit" 
              disabled={isLoading || loading} 
              className="w-full h-11 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
            >
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

        <CardFooter className="border-t pt-6">
          <p className="text-center text-sm text-gray-600 dark:text-gray-400 w-full">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-emerald-600 hover:text-emerald-700 hover:underline font-semibold">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </AuthLayout>
  )
}
