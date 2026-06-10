"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Heart, CreditCard, Lock, AlertCircle, Loader2 } from "lucide-react"
import { validateEmail } from "@/lib/api-client"

interface DonationTier {
  amount: number
  description: string
}

interface DonationModalProps {
  isOpen: boolean
  onClose: () => void
  campaign: {
    id: string
    title: string
    donationTiers?: DonationTier[]
  }
}

export function DonationModal({ isOpen, onClose, campaign }: DonationModalProps) {
  const [amount, setAmount] = useState("")
  const [selectedTier, setSelectedTier] = useState("")
  const [donorName, setDonorName] = useState("")
  const [donorEmail, setDonorEmail] = useState("")
  const [message, setMessage] = useState("")
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [coverFees, setCoverFees] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [errors, setErrors] = useState<{
    amount?: string
    donorName?: string
    donorEmail?: string
  }>({})

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const handleTierSelect = (tierAmount: string) => {
    setSelectedTier(tierAmount)
    setAmount(tierAmount)
  }

  const calculateFees = () => {
    const donationAmount = Number.parseFloat(amount) || 0
    if (donationAmount <= 0) return { platformFee: 0, processingFee: 0, total: 0, netToCampaign: 0 }
    
    // 5% platform fee (always deducted from donation)
    const platformFee = donationAmount * 0.05
    
    // 2.9% + $0.30 processing fee (only if user covers fees)
    const processingFee = coverFees ? donationAmount * 0.029 + 0.3 : 0
    
    return {
      platformFee,
      processingFee,
      total: donationAmount + processingFee,
      netToCampaign: donationAmount - platformFee,
    }
  }

  const calculateTotal = () => {
    return calculateFees().total
  }

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {}

    // Validate amount
    const donationAmount = Number.parseFloat(amount) || 0
    if (!amount || donationAmount <= 0) {
      newErrors.amount = "Please enter a valid donation amount"
    } else if (donationAmount < 1) {
      newErrors.amount = "Minimum donation is $1"
    } else if (donationAmount > 100000) {
      newErrors.amount = "Maximum donation is $100,000"
    }

    // Validate donor name (if not anonymous)
    if (!isAnonymous) {
      if (!donorName.trim()) {
        newErrors.donorName = "Name is required"
      } else if (donorName.trim().length < 2) {
        newErrors.donorName = "Name must be at least 2 characters"
      }
    }

    // Validate email (if not anonymous)
    if (!isAnonymous) {
      if (!donorEmail.trim()) {
        newErrors.donorEmail = "Email is required"
      } else if (!validateEmail(donorEmail)) {
        newErrors.donorEmail = "Please enter a valid email address"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8090'
      const donationAmount = Number.parseFloat(amount) || 0
      const response = await fetch(`${apiUrl}/api/donation/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaign_id: campaign.id,
          donor_name: isAnonymous ? '' : donorName,
          donor_email: isAnonymous ? '' : donorEmail,
          amount: donationAmount,
          is_anonymous: isAnonymous,
          message: message,
          payment_method: 'card',
          cover_fees: coverFees,
        }),
      })

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.message || 'Donation failed')
      }

      const data = await response.json()
      window.location.href = `/donation-success/${data.id || data.donation_id || campaign.id}`
    } catch (error: any) {
      setSubmitError(error.message || 'Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">Support: {campaign.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Error Messages */}
          {submitError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{submitError}</AlertDescription>
            </Alert>
          )}
          {(errors.amount || errors.donorName || errors.donorEmail) && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {errors.amount || errors.donorName || errors.donorEmail}
              </AlertDescription>
            </Alert>
          )}

          {/* Donation Amount */}
          <div>
            <Label className="text-lg font-semibold mb-4 block">Choose your donation amount</Label>

            {/* Preset Amounts */}
            {campaign.donationTiers && campaign.donationTiers.length > 0 && (
              <RadioGroup value={selectedTier} onValueChange={handleTierSelect} className="space-y-3 mb-4">
                {campaign.donationTiers.map((tier, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                    <RadioGroupItem value={tier.amount.toString()} id={`tier-${index}`} />
                    <Label htmlFor={`tier-${index}`} className="flex-1 cursor-pointer">
                      <div className="font-semibold text-emerald-600">{formatCurrency(tier.amount)}</div>
                      <div className="text-sm text-gray-600">{tier.description}</div>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            )}

            {/* Custom Amount */}
            <div>
              <Label htmlFor="custom-amount" className="text-sm font-medium">
                Or enter a custom amount
              </Label>
              <div className="relative mt-1">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                <Input
                  id="custom-amount"
                  type="number"
                  placeholder="0"
                  value={amount}
                  onChange={(e) => {
                    setAmount(e.target.value)
                    setSelectedTier("")
                  }}
                  className="pl-8 text-lg h-12"
                />
              </div>
            </div>
          </div>

          {/* Donor Information */}
          <div className="space-y-4">
            <Label className="text-lg font-semibold">Your information</Label>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="donor-name">Full Name {!isAnonymous && <span className="text-red-500">*</span>}</Label>
                <Input
                  id="donor-name"
                  value={donorName}
                  onChange={(e) => {
                    setDonorName(e.target.value)
                    if (errors.donorName) setErrors(prev => ({ ...prev, donorName: undefined }))
                  }}
                  placeholder="Enter your name"
                  className={errors.donorName ? "border-red-500" : ""}
                  disabled={isAnonymous}
                />
                {errors.donorName && <p className="text-sm text-red-500 mt-1">{errors.donorName}</p>}
              </div>
              <div>
                <Label htmlFor="donor-email">Email Address {!isAnonymous && <span className="text-red-500">*</span>}</Label>
                <Input
                  id="donor-email"
                  type="email"
                  value={donorEmail}
                  onChange={(e) => {
                    setDonorEmail(e.target.value)
                    if (errors.donorEmail) setErrors(prev => ({ ...prev, donorEmail: undefined }))
                  }}
                  placeholder="Enter your email"
                  className={errors.donorEmail ? "border-red-500" : ""}
                  disabled={isAnonymous}
                />
                {errors.donorEmail && <p className="text-sm text-red-500 mt-1">{errors.donorEmail}</p>}
              </div>
            </div>

            <div>
              <Label htmlFor="message">Message (Optional)</Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Leave a message of support..."
                rows={3}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox id="anonymous" checked={isAnonymous} onCheckedChange={(checked) => setIsAnonymous(checked === true)} />
              <Label htmlFor="anonymous" className="text-sm">
                Make this donation anonymous
              </Label>
            </div>
          </div>

          {/* Fee Coverage */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Checkbox id="cover-fees" checked={coverFees} onCheckedChange={(checked) => setCoverFees(checked === true)} />
              <Label htmlFor="cover-fees" className="text-sm font-medium">
                Help cover transaction fees
              </Label>
            </div>
            <p className="text-xs text-gray-600">By covering fees, more of your donation goes directly to the cause.</p>
          </div>

          {/* Payment Summary */}
          <div className="bg-emerald-50 p-4 rounded-lg space-y-2">
            <div className="flex justify-between items-center">
              <span>Donation Amount:</span>
              <span className="font-semibold">{formatCurrency(Number.parseFloat(amount) || 0)}</span>
            </div>
            <div className="flex justify-between items-center text-sm text-gray-600">
              <span>Platform fee (5%):</span>
              <span>{formatCurrency(calculateFees().platformFee)}</span>
            </div>
            <div className="text-xs text-gray-500 italic">
              Net to campaign: {formatCurrency(calculateFees().netToCampaign)}
            </div>
            {coverFees && (
              <div className="flex justify-between items-center text-sm">
                <span>Processing fee (2.9% + $0.30):</span>
                <span>{formatCurrency(calculateFees().processingFee)}</span>
              </div>
            )}
            <div className="flex justify-between items-center font-semibold text-lg border-t pt-2 mt-2">
              <span>Total to pay:</span>
              <span className="text-emerald-700">{formatCurrency(calculateTotal())}</span>
            </div>
          </div>

          {/* Payment Method (UI Only) */}
          <div className="space-y-4">
            <Label className="text-lg font-semibold">Payment Method</Label>
            <div className="border rounded-lg p-4 bg-gray-50">
              <div className="flex items-center space-x-3 mb-3">
                <CreditCard className="w-5 h-5 text-gray-600" />
                <span className="font-medium">Credit/Debit Card</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input placeholder="Card Number" />
                <Input placeholder="MM/YY" />
                <Input placeholder="CVV" />
                <Input placeholder="ZIP Code" />
              </div>
            </div>
          </div>

          {/* Security Notice */}
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Lock className="w-4 h-4" />
            <span>Your payment information is secure and encrypted</span>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button
              className="flex-1 bg-emerald-600 hover:bg-emerald-700"
              disabled={!amount || Number.parseFloat(amount) <= 0 || isSubmitting}
              onClick={handleSubmit}
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Heart className="w-4 h-4 mr-2" />
              )}
              {isSubmitting ? 'Processing...' : `Donate ${formatCurrency(calculateTotal())}`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
