"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Heart, Lock, Shield, CreditCard, Users, ArrowLeft, CheckCircle, Star, DollarSign } from "lucide-react"

interface DonationPaymentPageProps {
  campaignId: string
}

export function DonationPaymentPage({ campaignId }: DonationPaymentPageProps) {
  const [donationAmount, setDonationAmount] = useState("")
  const [customAmount, setCustomAmount] = useState("")
  const [selectedAmount, setSelectedAmount] = useState("")
  const [donorInfo, setDonorInfo] = useState({
    firstName: "",
    lastName: "",
    email: "",
    message: "",
    isAnonymous: false,
    coverFees: true,
    newsletter: false,
  })
  const [paymentMethod, setPaymentMethod] = useState("card")
  const [cardInfo, setCardInfo] = useState({
    number: "",
    expiry: "",
    cvv: "",
    name: "",
    zip: "",
  })

  // Mock campaign data
  const campaign = {
    id: campaignId,
    title: "Help Sarah's Medical Treatment",
    organizer: "John Smith",
    image: "/placeholder.svg?height=300&width=400",
    raised: 32500,
    goal: 50000,
    donors: 245,
    description: "Supporting Sarah through her cancer treatment journey",
    category: "Medical",
    verified: true,
  }

  const suggestedAmounts = [25, 50, 100, 250, 500, 1000]

  const calculateTotal = () => {
    const amount = Number.parseFloat(selectedAmount || customAmount || "0")
    const feeAmount = donorInfo.coverFees ? amount * 0.029 + 0.3 : 0
    return amount + feeAmount
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const progressPercentage = (campaign.raised / campaign.goal) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button asChild variant="ghost" className="text-gray-600 hover:text-gray-900">
            <Link href={`/campaign/${campaignId}`}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Campaign
            </Link>
          </Button>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Shield className="w-4 h-4 text-emerald-600" />
            <span>Secure Donation</span>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Payment Form */}
          <div className="lg:col-span-2 space-y-8">
            {/* Donation Amount */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="pb-6">
                <CardTitle className="flex items-center text-2xl">
                  <Heart className="w-6 h-6 text-red-500 mr-3" />
                  Your Donation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Suggested Amounts */}
                <div>
                  <Label className="text-base font-semibold mb-4 block">Choose an amount</Label>
                  <RadioGroup
                    value={selectedAmount}
                    onValueChange={(value) => {
                      setSelectedAmount(value)
                      setCustomAmount("")
                    }}
                    className="grid grid-cols-3 gap-3"
                  >
                    {suggestedAmounts.map((amount) => (
                      <div key={amount} className="relative">
                        <RadioGroupItem value={amount.toString()} id={`amount-${amount}`} className="peer sr-only" />
                        <Label
                          htmlFor={`amount-${amount}`}
                          className="flex items-center justify-center p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-emerald-300 hover:bg-emerald-50 peer-checked:border-emerald-600 peer-checked:bg-emerald-50 peer-checked:text-emerald-700 transition-all duration-200"
                        >
                          <span className="font-semibold">{formatCurrency(amount)}</span>
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                {/* Custom Amount */}
                <div>
                  <Label htmlFor="custom-amount" className="text-base font-semibold">
                    Or enter a custom amount
                  </Label>
                  <div className="relative mt-2">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <Input
                      id="custom-amount"
                      type="number"
                      placeholder="0.00"
                      value={customAmount}
                      onChange={(e) => {
                        setCustomAmount(e.target.value)
                        setSelectedAmount("")
                      }}
                      className="pl-12 h-14 text-lg border-2 focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Fee Coverage */}
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="cover-fees"
                      checked={donorInfo.coverFees}
                      onCheckedChange={(checked) => setDonorInfo({ ...donorInfo, coverFees: checked as boolean })}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <Label htmlFor="cover-fees" className="font-medium text-gray-900 cursor-pointer">
                        Help cover transaction fees
                      </Label>
                      <p className="text-sm text-gray-600 mt-1">
                        By covering fees, more of your donation goes directly to the cause. This adds{" "}
                        {formatCurrency(Number.parseFloat(selectedAmount || customAmount || "0") * 0.029 + 0.3 || 0)} to
                        your total.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Donor Information */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <Users className="w-5 h-5 text-blue-600 mr-3" />
                  Your Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={donorInfo.firstName}
                      onChange={(e) => setDonorInfo({ ...donorInfo, firstName: e.target.value })}
                      className="mt-1 h-12"
                      placeholder="Enter your first name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={donorInfo.lastName}
                      onChange={(e) => setDonorInfo({ ...donorInfo, lastName: e.target.value })}
                      className="mt-1 h-12"
                      placeholder="Enter your last name"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={donorInfo.email}
                    onChange={(e) => setDonorInfo({ ...donorInfo, email: e.target.value })}
                    className="mt-1 h-12"
                    placeholder="your.email@example.com"
                  />
                  <p className="text-sm text-gray-500 mt-1">You'll receive a donation receipt at this email</p>
                </div>

                <div>
                  <Label htmlFor="message">Message (Optional)</Label>
                  <Textarea
                    id="message"
                    value={donorInfo.message}
                    onChange={(e) => setDonorInfo({ ...donorInfo, message: e.target.value })}
                    placeholder="Leave a message of support..."
                    rows={3}
                    className="mt-1"
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id="anonymous"
                      checked={donorInfo.isAnonymous}
                      onCheckedChange={(checked) => setDonorInfo({ ...donorInfo, isAnonymous: checked as boolean })}
                    />
                    <Label htmlFor="anonymous" className="text-sm cursor-pointer">
                      Make this donation anonymous
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id="newsletter"
                      checked={donorInfo.newsletter}
                      onCheckedChange={(checked) => setDonorInfo({ ...donorInfo, newsletter: checked as boolean })}
                    />
                    <Label htmlFor="newsletter" className="text-sm cursor-pointer">
                      Subscribe to updates about this campaign
                    </Label>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <CreditCard className="w-5 h-5 text-green-600 mr-3" />
                  Payment Method
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                  <div className="flex items-center space-x-3 p-4 border-2 border-gray-200 rounded-xl hover:border-emerald-300 has-[:checked]:border-emerald-600 has-[:checked]:bg-emerald-50">
                    <RadioGroupItem value="card" id="card" />
                    <Label htmlFor="card" className="flex-1 cursor-pointer font-medium">
                      Credit or Debit Card
                    </Label>
                    <div className="flex space-x-2">
                      <div className="w-8 h-5 bg-blue-600 rounded text-white text-xs flex items-center justify-center font-bold">
                        VISA
                      </div>
                      <div className="w-8 h-5 bg-red-600 rounded text-white text-xs flex items-center justify-center font-bold">
                        MC
                      </div>
                      <div className="w-8 h-5 bg-blue-800 rounded text-white text-xs flex items-center justify-center font-bold">
                        AMEX
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-4 border-2 border-gray-200 rounded-xl hover:border-emerald-300 has-[:checked]:border-emerald-600 has-[:checked]:bg-emerald-50">
                    <RadioGroupItem value="paypal" id="paypal" />
                    <Label htmlFor="paypal" className="flex-1 cursor-pointer font-medium">
                      PayPal
                    </Label>
                    <div className="text-blue-600 font-bold text-sm">PayPal</div>
                  </div>
                  <div className="flex items-center space-x-3 p-4 border-2 border-gray-200 rounded-xl hover:border-emerald-300 has-[:checked]:border-emerald-600 has-[:checked]:bg-emerald-50">
                    <RadioGroupItem value="apple" id="apple" />
                    <Label htmlFor="apple" className="flex-1 cursor-pointer font-medium">
                      Apple Pay
                    </Label>
                    <div className="text-gray-900 font-bold text-sm"> Pay</div>
                  </div>
                </RadioGroup>

                {paymentMethod === "card" && (
                  <div className="space-y-4 pt-4 border-t">
                    <div>
                      <Label htmlFor="cardNumber">Card Number</Label>
                      <Input
                        id="cardNumber"
                        value={cardInfo.number}
                        onChange={(e) => setCardInfo({ ...cardInfo, number: e.target.value })}
                        placeholder="1234 5678 9012 3456"
                        className="mt-1 h-12"
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="expiry">Expiry</Label>
                        <Input
                          id="expiry"
                          value={cardInfo.expiry}
                          onChange={(e) => setCardInfo({ ...cardInfo, expiry: e.target.value })}
                          placeholder="MM/YY"
                          className="mt-1 h-12"
                        />
                      </div>
                      <div>
                        <Label htmlFor="cvv">CVV</Label>
                        <Input
                          id="cvv"
                          value={cardInfo.cvv}
                          onChange={(e) => setCardInfo({ ...cardInfo, cvv: e.target.value })}
                          placeholder="123"
                          className="mt-1 h-12"
                        />
                      </div>
                      <div>
                        <Label htmlFor="zip">ZIP Code</Label>
                        <Input
                          id="zip"
                          value={cardInfo.zip}
                          onChange={(e) => setCardInfo({ ...cardInfo, zip: e.target.value })}
                          placeholder="12345"
                          className="mt-1 h-12"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="cardName">Name on Card</Label>
                      <Input
                        id="cardName"
                        value={cardInfo.name}
                        onChange={(e) => setCardInfo({ ...cardInfo, name: e.target.value })}
                        placeholder="Full name as it appears on card"
                        className="mt-1 h-12"
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Security Notice */}
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-600 bg-gray-50 p-4 rounded-xl">
              <Lock className="w-4 h-4 text-emerald-600" />
              <span>Your payment information is secure and encrypted with 256-bit SSL</span>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Campaign Summary */}
            <Card className="border-0 shadow-lg sticky top-8">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4 mb-6">
                  <Image
                    src={campaign.image || "/placeholder.svg"}
                    alt={campaign.title}
                    width={80}
                    height={80}
                    className="rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">{campaign.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">by {campaign.organizer}</p>
                    {campaign.verified && (
                      <Badge variant="secondary" className="text-xs">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{formatCurrency(campaign.raised)} raised</span>
                    <span className="text-gray-600">of {formatCurrency(campaign.goal)} goal</span>
                  </div>
                  <Progress value={progressPercentage} className="h-2" />
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>{campaign.donors} donors</span>
                    <span>{Math.round(progressPercentage)}% funded</span>
                  </div>
                </div>

                <Separator className="my-6" />

                {/* Donation Summary */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900">Donation Summary</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Your donation:</span>
                      <span className="font-medium">
                        {formatCurrency(Number.parseFloat(selectedAmount || customAmount || "0"))}
                      </span>
                    </div>
                    {donorInfo.coverFees && (
                      <div className="flex justify-between text-gray-600">
                        <span>Platform fee:</span>
                        <span>
                          {formatCurrency(Number.parseFloat(selectedAmount || customAmount || "0") * 0.029 + 0.3 || 0)}
                        </span>
                      </div>
                    )}
                    <Separator />
                    <div className="flex justify-between font-semibold text-lg">
                      <span>Total:</span>
                      <span className="text-emerald-600">{formatCurrency(calculateTotal())}</span>
                    </div>
                  </div>
                </div>

                <Button
                  className="w-full mt-6 h-14 text-lg bg-emerald-600 hover:bg-emerald-700 shadow-lg"
                  disabled={!selectedAmount && !customAmount}
                >
                  <Heart className="w-5 h-5 mr-2" />
                  Complete Donation
                </Button>

                <div className="mt-4 text-center">
                  <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
                    <Shield className="w-3 h-3" />
                    <span>Protected by our Donor Protection Guarantee</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Trust Indicators */}
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <Star className="w-4 h-4 text-yellow-500 mr-2" />
                  Why Donate Here?
                </h4>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <span>Funds go directly to the beneficiary</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <span>Your donation is protected by our guarantee</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <span>Get updates on how your donation helps</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <span>Tax-deductible receipt provided</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Donors */}
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <h4 className="font-semibold text-gray-900 mb-4">Recent Supporters</h4>
                <div className="space-y-3">
                  {[
                    { name: "Anonymous", amount: 100, time: "2 hours ago" },
                    { name: "Maria G.", amount: 50, time: "5 hours ago" },
                    { name: "David L.", amount: 25, time: "1 day ago" },
                  ].map((donor, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <div>
                        <div className="font-medium">{donor.name}</div>
                        <div className="text-gray-500">{donor.time}</div>
                      </div>
                      <div className="font-semibold text-emerald-600">{formatCurrency(donor.amount)}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
