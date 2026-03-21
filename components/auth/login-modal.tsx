"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { Eye, EyeOff, Mail, Lock, ArrowRight, CheckCircle2, AlertCircle, Heart } from "lucide-react"
import { validateEmail } from "@/lib/auth-validation"

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
  onSwitchToSignup?: () => void
}

export default function LoginModal({ isOpen, onClose, onSwitchToSignup }: LoginModalProps) {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [touchedFields, setTouchedFields] = useState<{ [key: string]: boolean }>({})
  const router = useRouter()

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        email: "",
        password: "",
      })
      setErrors({})
      setTouchedFields({})
      setShowPassword(false)
      setIsSubmitting(false)
    }
  }, [isOpen])

  const handleInputChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value })
    setErrors({ ...errors, [name]: "" })

    // Validate on change if field has been touched
    if (touchedFields[name]) {
      validateField(name, value)
    }
  }

  const handleBlur = (name: string) => {
    setTouchedFields({ ...touchedFields, [name]: true })
    validateField(name, formData[name as keyof typeof formData])
  }

  const validateField = (name: string, value: string) => {
    let error = ""

    switch (name) {
      case "email":
        const emailValidation = validateEmail(value)
        if (!emailValidation.isValid) error = emailValidation.errors[0]
        break
      case "password":
        if (!value.trim()) error = "Password is required"
        break
    }

    setErrors((prev) => ({ ...prev, [name]: error }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Mark all fields as touched
    const allTouched = Object.keys(formData).reduce(
      (acc, key) => {
        acc[key] = true
        return acc
      },
      {} as { [key: string]: boolean },
    )

    setTouchedFields(allTouched)

    // Validate all fields
    const validationErrors: { [key: string]: string } = {}

    const emailValidation = validateEmail(formData.email)
    if (!emailValidation.isValid) validationErrors.email = emailValidation.errors[0]

    if (!formData.password.trim()) {
      validationErrors.password = "Password is required"
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    // Simulate API call
    try {
      setIsSubmitting(true)
      // Replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 1500))
      console.log("Login submitted:", formData)
      onClose()
      router.push("/dashboard") // Redirect to dashboard
    } catch (error) {
      console.error("Login failed:", error)
      setErrors({ form: "Login failed. Please check your credentials." })
    } finally {
      setIsSubmitting(false)
    }
  }

  const getInputState = (fieldName: string) => {
    if (!touchedFields[fieldName]) return ""
    return errors[fieldName] ? "error" : "success"
  }

  const handleSocialLogin = (provider: string) => {
    console.log(`Login with ${provider}`)
    // Implement social login logic here
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px] max-h-[90vh] overflow-y-auto p-0">
        <div className="relative">
          {/* Header */}
          <DialogHeader className="px-6 pt-8 pb-6 border-b bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-gray-800 dark:to-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
                  <Heart className="w-5 h-5 text-white fill-current" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-bold">Welcome Back</DialogTitle>
                  <p className="text-sm text-muted-foreground mt-1">Sign in to your FundRaise account</p>
                </div>
              </div>
            </div>
          </DialogHeader>

          {/* Form Content */}
          <div className="px-8 py-6">
            <form onSubmit={handleSubmit} className="space-y-5 mx-auto">
              <div className="space-y-2">
                <Label htmlFor="modal-email" className="text-sm font-medium">
                  Email Address
                </Label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                    <Mail size={18} />
                  </div>
                  <Input
                    id="modal-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    className={cn(
                      "pl-10 transition-all",
                      errors.email ? "border-red-500 focus-visible:ring-red-500" : "",
                      getInputState("email") === "success" ? "border-green-500 focus-visible:ring-green-500" : "",
                    )}
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    onBlur={() => handleBlur("email")}
                    disabled={isSubmitting}
                  />
                  {touchedFields.email && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      {errors.email ? (
                        <AlertCircle size={18} className="text-red-500" />
                      ) : formData.email ? (
                        <CheckCircle2 size={18} className="text-green-500" />
                      ) : null}
                    </div>
                  )}
                </div>
                {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="modal-password" className="text-sm font-medium">
                  Password
                </Label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                    <Lock size={18} />
                  </div>
                  <Input
                    id="modal-password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    className={cn(
                      "pl-10 pr-10 transition-all",
                      errors.password ? "border-red-500 focus-visible:ring-red-500" : "",
                      getInputState("password") === "success" ? "border-green-500 focus-visible:ring-green-500" : "",
                    )}
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    onBlur={() => handleBlur("password")}
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && <p className="text-sm text-red-500 mt-1">{errors.password}</p>}
              </div>

              {errors.form && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3">
                  <p className="text-sm text-red-600 dark:text-red-400">{errors.form}</p>
                </div>
              )}

              <div className="pt-2">
                <Button type="submit" className="w-full h-11 text-base font-medium" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <span className="flex items-center justify-center">
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Signing in...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center">
                      Sign in <ArrowRight className="ml-2 h-5 w-5" />
                    </span>
                  )}
                </Button>
              </div>
            </form>

            <div className="relative mt-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-300 dark:border-gray-700" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 mt-4">
              <Button
                variant="outline"
                type="button"
                disabled={isSubmitting}
                className="h-10"
                onClick={() => handleSocialLogin("google")}
              >
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.81.61 5.04 1.64l-2.86 2.22c-.61-.38-1.26-.61-1.94-.61-2.86 0-5.29 1.94-6.16 4.53H5.84V5.38z"
                    fill="#EA4335"
                  />
                </svg>
                Google
              </Button>
            </div>

            <div className="mt-5 text-sm text-muted-foreground">
              Don't have an account?{" "}
              <button className="text-blue-500 hover:underline font-medium" onClick={onSwitchToSignup}>
                Sign up
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
