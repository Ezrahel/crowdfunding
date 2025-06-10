"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Heart, CreditCard, Lock } from "lucide-react"

interface DonationModalProps {
  isOpen: boolean
  onClose: () => void
  campaign: {
    title: string
    donationTiers: Array<{
      amount: number
      description: string
    }>
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

  const calculateTotal = () => {
    const donationAmount = Number.parseFloat(amount) || 0
    const feeAmount = coverFees ? donationAmount * 0.029 + 0.3 : 0
    return donationAmount + feeAmount
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">Support: {campaign.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Donation Amount */}
          <div>
            <Label className="text-lg font-semibold mb-4 block">Choose your donation amount</Label>

            {/* Preset Amounts */}
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
                <Label htmlFor="donor-name">Full Name</Label>
                <Input
                  id="donor-name"
                  value={donorName}
                  onChange={(e) => setDonorName(e.target.value)}
                  placeholder="Enter your name"
                />
              </div>
              <div>
                <Label htmlFor="donor-email">Email Address</Label>
                <Input
                  id="donor-email"
                  type="email"
                  value={donorEmail}
                  onChange={(e) => setDonorEmail(e.target.value)}
                  placeholder="Enter your email"
                />
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
              <Checkbox id="anonymous" checked={isAnonymous} onCheckedChange={setIsAnonymous} />
              <Label htmlFor="anonymous" className="text-sm">
                Make this donation anonymous
              </Label>
            </div>
          </div>

          {/* Fee Coverage */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Checkbox id="cover-fees" checked={coverFees} onCheckedChange={setCoverFees} />
              <Label htmlFor="cover-fees" className="text-sm font-medium">
                Help cover transaction fees
              </Label>
            </div>
            <p className="text-xs text-gray-600">By covering fees, more of your donation goes directly to the cause.</p>
          </div>

          {/* Payment Summary */}
          <div className="bg-emerald-50 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span>Donation:</span>
              <span>{formatCurrency(Number.parseFloat(amount) || 0)}</span>
            </div>
            {coverFees && (
              <div className="flex justify-between items-center mb-2 text-sm">
                <span>Transaction fee:</span>
                <span>{formatCurrency((Number.parseFloat(amount) || 0) * 0.029 + 0.3)}</span>
              </div>
            )}
            <div className="flex justify-between items-center font-semibold text-lg border-t pt-2">
              <span>Total:</span>
              <span>{formatCurrency(calculateTotal())}</span>
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
              disabled={!amount || Number.parseFloat(amount) <= 0}
            >
              <Heart className="w-4 h-4 mr-2" />
              Donate {formatCurrency(calculateTotal())}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
