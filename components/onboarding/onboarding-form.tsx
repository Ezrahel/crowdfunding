"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, XCircle, CheckCircle2, Building2, CreditCard, FileText, ArrowRight, X } from "lucide-react"
import AuthLayout from "@/components/auth/auth-layout"

interface OnboardingStatus {
  status: "pending" | "in_progress" | "completed" | "skipped"
  has_virtual_account: boolean
  virtual_account?: {
    account_number: string
    account_name: string
    bank: string
  }
}

export default function OnboardingForm() {
  const router = useRouter()
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingStatus, setIsLoadingStatus] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [onboardingStatus, setOnboardingStatus] = useState<OnboardingStatus | null>(null)
  
  const [formData, setFormData] = useState({
    national_id_number: "",
    bvn: "",
    tin: "",
  })

  const [errors, setErrors] = useState({
    national_id_number: "",
    bvn: "",
    tin: "",
  })

  useEffect(() => {
    if (!user) {
      router.push("/auth/login")
      return
    }

    fetchOnboardingStatus()
  }, [user, router])

  const fetchOnboardingStatus = async () => {
    if (!user) return

    try {
      const token = await user.getIdToken()
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000)
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8090"}/api/onboarding/status`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        signal: controller.signal,
      })
      
      clearTimeout(timeoutId)

      if (response.ok) {
        const data = await response.json()
        setOnboardingStatus(data)
        
        if (data.status === "completed") {
          setSuccess(true)
        }
      }
    } catch (err) {
      // Error logged but not shown to user to avoid cluttering UI
      // In production, send to error tracking service
    } finally {
      setIsLoadingStatus(false)
    }
  }

  const validateForm = () => {
    const newErrors = {
      national_id_number: "",
      bvn: "",
      tin: "",
    }

    // Validate NIN (11 digits)
    if (!formData.national_id_number) {
      newErrors.national_id_number = "National ID Number is required"
    } else if (!/^\d{11}$/.test(formData.national_id_number)) {
      newErrors.national_id_number = "NIN must be exactly 11 digits"
    }

    // Validate BVN (11 digits)
    if (!formData.bvn) {
      newErrors.bvn = "BVN is required"
    } else if (!/^\d{11}$/.test(formData.bvn)) {
      newErrors.bvn = "BVN must be exactly 11 digits"
    }

    // Validate TIN (9-12 digits)
    if (!formData.tin) {
      newErrors.tin = "TIN is required"
    } else if (!/^\d{9,12}$/.test(formData.tin)) {
      newErrors.tin = "TIN must be between 9 and 12 digits"
    }

    setErrors(newErrors)
    return !newErrors.national_id_number && !newErrors.bvn && !newErrors.tin
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!validateForm()) {
      return
    }

    if (!user) {
      router.push("/auth/login")
      return
    }

    setIsLoading(true)

    try {
      const token = await user.getIdToken()
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000)
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8090"}/api/onboarding/submit`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
        signal: controller.signal,
      })
      
      clearTimeout(timeoutId)

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to submit onboarding")
      }

      setSuccess(true)
      setOnboardingStatus(data)
      
      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        router.push("/dashboard")
      }, 2000)
    } catch (err: any) {
      console.error("Error submitting onboarding:", err)
      setError(err.message || "Failed to submit onboarding. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSkip = async () => {
    if (!user) return

    if (!confirm("Are you sure you want to skip onboarding? You can complete it later from your profile.")) {
      return
    }

    setIsLoading(true)

    try {
      const token = await user.getIdToken()
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000)
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8090"}/api/onboarding/skip`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        signal: controller.signal,
      })
      
      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error("Failed to skip onboarding")
      }

      router.push("/dashboard")
    } catch (err: any) {
      console.error("Error skipping onboarding:", err)
      setError(err.message || "Failed to skip onboarding. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    // Only allow digits
    const numericValue = value.replace(/\D/g, "")
    setFormData(prev => ({ ...prev, [field]: numericValue }))
    
    // Clear error for this field
    if (errors[field as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [field]: "" }))
    }
  }

  if (isLoadingStatus) {
    return (
      <AuthLayout>
        <Card className="w-full max-w-2xl shadow-xl border-0 bg-white/95 backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
            </div>
          </CardContent>
        </Card>
      </AuthLayout>
    )
  }

  if (onboardingStatus?.status === "completed") {
    return (
      <AuthLayout>
        <Card className="w-full max-w-2xl shadow-xl border-0 bg-white/95 backdrop-blur-sm">
          <CardHeader className="space-y-1 text-center">
            <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="h-8 w-8 text-emerald-600" />
            </div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Onboarding Completed!
            </CardTitle>
            <CardDescription className="text-base pt-2">
              Your dedicated virtual account has been created successfully
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {onboardingStatus.virtual_account && (
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg p-6 border border-emerald-200">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-emerald-600" />
                  Your Virtual Account Details
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Account Number</p>
                    <p className="text-xl font-bold text-gray-900">{onboardingStatus.virtual_account.account_number}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Account Name</p>
                    <p className="text-lg font-semibold text-gray-900">{onboardingStatus.virtual_account.account_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Bank</p>
                    <p className="text-lg font-semibold text-gray-900">{onboardingStatus.virtual_account.bank}</p>
                  </div>
                </div>
              </div>
            )}

            <Alert className="border-emerald-200 bg-emerald-50">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <AlertDescription className="text-emerald-800">
                Redirecting to dashboard...
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout>
      <Card className="w-full max-w-2xl shadow-xl border-0 bg-white/95 backdrop-blur-sm">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                Complete Your Profile
              </CardTitle>
              <CardDescription className="text-base pt-2">
                Get a dedicated virtual account by completing your KYC verification
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/dashboard")}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
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
                Onboarding completed successfully! Creating your virtual account...
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="national_id_number" className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-emerald-600" />
                    National Identity Number (NIN)
                  </div>
                </label>
                <Input
                  id="national_id_number"
                  type="text"
                  placeholder="Enter your 11-digit NIN"
                  value={formData.national_id_number}
                  onChange={(e) => handleInputChange("national_id_number", e.target.value)}
                  maxLength={11}
                  className={errors.national_id_number ? "border-red-500" : ""}
                  disabled={isLoading}
                />
                {errors.national_id_number && (
                  <p className="mt-1 text-sm text-red-600">{errors.national_id_number}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">11-digit National Identity Number</p>
              </div>

              <div>
                <label htmlFor="bvn" className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-emerald-600" />
                    Bank Verification Number (BVN)
                  </div>
                </label>
                <Input
                  id="bvn"
                  type="text"
                  placeholder="Enter your 11-digit BVN"
                  value={formData.bvn}
                  onChange={(e) => handleInputChange("bvn", e.target.value)}
                  maxLength={11}
                  className={errors.bvn ? "border-red-500" : ""}
                  disabled={isLoading}
                />
                {errors.bvn && (
                  <p className="mt-1 text-sm text-red-600">{errors.bvn}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">11-digit Bank Verification Number</p>
              </div>

              <div>
                <label htmlFor="tin" className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-emerald-600" />
                    Tax Identification Number (TIN)
                  </div>
                </label>
                <Input
                  id="tin"
                  type="text"
                  placeholder="Enter your 9-12 digit TIN"
                  value={formData.tin}
                  onChange={(e) => handleInputChange("tin", e.target.value)}
                  maxLength={12}
                  className={errors.tin ? "border-red-500" : ""}
                  disabled={isLoading}
                />
                {errors.tin && (
                  <p className="mt-1 text-sm text-red-600">{errors.tin}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">9-12 digit Tax Identification Number</p>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                disabled={isLoading}
                className="flex-1 h-12 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    Complete Onboarding
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleSkip}
                disabled={isLoading}
                className="h-12"
              >
                Skip for Now
              </Button>
            </div>
          </form>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Why complete onboarding?</strong> Get a dedicated virtual account to receive donations directly. 
              You can complete this later from your profile if you skip now.
            </p>
          </div>
        </CardContent>
      </Card>
    </AuthLayout>
  )
}

