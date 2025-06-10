"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, Check, CreditCard, Edit, Plus, Shield, Trash2, X, Zap } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface DebitCard {
  id: string
  cardNumber: string
  cardType: string
  expiryDate: string
  cardholderName: string
  isVerified: boolean
  isPrimary: boolean
  addedDate: string
  lastUsed?: string
  bankName?: string
}

export function DebitCardSettings() {
  const [cards, setCards] = useState<DebitCard[]>([
    {
      id: "1",
      cardNumber: "****1234",
      cardType: "Visa",
      expiryDate: "12/26",
      cardholderName: "John Doe",
      isVerified: true,
      isPrimary: true,
      addedDate: "2024-01-15",
      lastUsed: "2024-01-20",
      bankName: "Chase Bank",
    },
    {
      id: "2",
      cardNumber: "****5678",
      cardType: "Mastercard",
      expiryDate: "08/25",
      cardholderName: "John Doe",
      isVerified: false,
      isPrimary: false,
      addedDate: "2024-01-10",
      bankName: "Bank of America",
    },
  ])

  const [showAddForm, setShowAddForm] = useState(false)
  const [editingCard, setEditingCard] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    cardNumber: "",
    expiryMonth: "",
    expiryYear: "",
    cardholderName: "",
    cvv: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const getCardType = (number: string) => {
    const num = number.replace(/\s/g, "")
    if (num.startsWith("4")) return "Visa"
    if (num.startsWith("5") || num.startsWith("2")) return "Mastercard"
    if (num.startsWith("3")) return "American Express"
    if (num.startsWith("6")) return "Discover"
    return "Unknown"
  }

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "")
    const matches = v.match(/\d{4,16}/g)
    const match = (matches && matches[0]) || ""
    const parts = []
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }
    if (parts.length) {
      return parts.join(" ")
    } else {
      return v
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.cardNumber.trim()) {
      newErrors.cardNumber = "Card number is required"
    } else if (formData.cardNumber.replace(/\s/g, "").length < 13) {
      newErrors.cardNumber = "Please enter a valid card number"
    }

    if (!formData.expiryMonth) newErrors.expiryMonth = "Expiry month is required"
    if (!formData.expiryYear) newErrors.expiryYear = "Expiry year is required"

    if (formData.expiryMonth && formData.expiryYear) {
      const currentDate = new Date()
      const currentYear = currentDate.getFullYear()
      const currentMonth = currentDate.getMonth() + 1
      const expYear = Number.parseInt(formData.expiryYear)
      const expMonth = Number.parseInt(formData.expiryMonth)

      if (expYear < currentYear || (expYear === currentYear && expMonth < currentMonth)) {
        newErrors.expiryMonth = "Card has expired"
      }
    }

    if (!formData.cardholderName.trim()) newErrors.cardholderName = "Cardholder name is required"
    if (!formData.cvv.trim()) {
      newErrors.cvv = "CVV is required"
    } else if (formData.cvv.length < 3) {
      newErrors.cvv = "CVV must be 3-4 digits"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsLoading(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000))

    const cardType = getCardType(formData.cardNumber)
    const maskedNumber = `****${formData.cardNumber.replace(/\s/g, "").slice(-4)}`

    if (editingCard) {
      // Update existing card
      setCards((prev) =>
        prev.map((card) =>
          card.id === editingCard
            ? {
                ...card,
                cardNumber: maskedNumber,
                cardType,
                expiryDate: `${formData.expiryMonth}/${formData.expiryYear.slice(-2)}`,
                cardholderName: formData.cardholderName,
                isVerified: false, // Re-verification needed after edit
              }
            : card,
        ),
      )
    } else {
      // Add new card
      const newCard: DebitCard = {
        id: Date.now().toString(),
        cardNumber: maskedNumber,
        cardType,
        expiryDate: `${formData.expiryMonth}/${formData.expiryYear.slice(-2)}`,
        cardholderName: formData.cardholderName,
        isVerified: false,
        isPrimary: cards.length === 0,
        addedDate: new Date().toISOString().split("T")[0],
      }
      setCards((prev) => [...prev, newCard])
    }

    // Reset form
    setFormData({
      cardNumber: "",
      expiryMonth: "",
      expiryYear: "",
      cardholderName: "",
      cvv: "",
    })
    setShowAddForm(false)
    setEditingCard(null)
    setIsLoading(false)
  }

  const handleEdit = (card: DebitCard) => {
    setFormData({
      cardNumber: "",
      expiryMonth: card.expiryDate.split("/")[0],
      expiryYear: `20${card.expiryDate.split("/")[1]}`,
      cardholderName: card.cardholderName,
      cvv: "",
    })
    setEditingCard(card.id)
    setShowAddForm(true)
  }

  const handleDelete = (cardId: string) => {
    setCards((prev) => prev.filter((card) => card.id !== cardId))
  }

  const handleSetPrimary = (cardId: string) => {
    setCards((prev) =>
      prev.map((card) => ({
        ...card,
        isPrimary: card.id === cardId,
      })),
    )
  }

  const handleVerify = async (cardId: string) => {
    setIsLoading(true)
    // Simulate verification process
    await new Promise((resolve) => setTimeout(resolve, 1500))

    setCards((prev) => prev.map((card) => (card.id === cardId ? { ...card, isVerified: true } : card)))
    setIsLoading(false)
  }

  const cancelForm = () => {
    setShowAddForm(false)
    setEditingCard(null)
    setFormData({
      cardNumber: "",
      expiryMonth: "",
      expiryYear: "",
      cardholderName: "",
      cvv: "",
    })
    setErrors({})
  }

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 10 }, (_, i) => currentYear + i)

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Debit Card Settings</h1>
        <p className="text-gray-600 dark:text-gray-400">Add your debit cards for instant fund withdrawals</p>
      </div>

      {/* Instant Withdrawal Feature */}
      <Card className="mb-6 bg-gradient-to-r from-yellow-50 to-orange-100 dark:from-yellow-950/20 dark:to-orange-900/20 border-yellow-200 dark:border-yellow-800">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-yellow-500 rounded-lg">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Instant Withdrawals Available</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Get your campaign funds in minutes instead of days with eligible debit cards
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Notice */}
      <Alert className="mb-6 border-blue-200 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-800">
        <Shield className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800 dark:text-blue-200">
          Your card information is encrypted and secure. We never store your full card number or CVV.
        </AlertDescription>
      </Alert>

      {/* Existing Cards */}
      <div className="space-y-4 mb-8">
        {cards.map((card) => (
          <Card key={card.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                    <CreditCard className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">
                      {card.cardType} {card.cardNumber}
                    </CardTitle>
                    <CardDescription>
                      Expires {card.expiryDate} • {card.cardholderName}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {card.isPrimary && (
                    <Badge
                      variant="default"
                      className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                    >
                      Primary
                    </Badge>
                  )}
                  {card.isVerified ? (
                    <Badge
                      variant="secondary"
                      className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                    >
                      <Check className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="border-orange-300 text-orange-700 dark:border-orange-700 dark:text-orange-400"
                    >
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Pending
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <Label className="text-sm text-gray-600 dark:text-gray-400">Card Type</Label>
                  <p className="font-medium">{card.cardType}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-600 dark:text-gray-400">Added</Label>
                  <p className="font-medium">{new Date(card.addedDate).toLocaleDateString()}</p>
                </div>
                {card.lastUsed && (
                  <div>
                    <Label className="text-sm text-gray-600 dark:text-gray-400">Last Used</Label>
                    <p className="font-medium">{new Date(card.lastUsed).toLocaleDateString()}</p>
                  </div>
                )}
                {card.bankName && (
                  <div>
                    <Label className="text-sm text-gray-600 dark:text-gray-400">Issuing Bank</Label>
                    <p className="font-medium">{card.bankName}</p>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {!card.isVerified && (
                  <Button
                    size="sm"
                    onClick={() => handleVerify(card.id)}
                    disabled={isLoading}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {isLoading ? "Verifying..." : "Verify Card"}
                  </Button>
                )}
                {!card.isPrimary && card.isVerified && (
                  <Button size="sm" variant="outline" onClick={() => handleSetPrimary(card.id)}>
                    Set as Primary
                  </Button>
                )}
                <Button size="sm" variant="outline" onClick={() => handleEdit(card)}>
                  <Edit className="h-3 w-3 mr-1" />
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDelete(card.id)}
                  className="text-red-600 border-red-300 hover:bg-red-50 dark:text-red-400 dark:border-red-700 dark:hover:bg-red-950/20"
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  Remove
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add New Card Button */}
      {!showAddForm && (
        <Button onClick={() => setShowAddForm(true)} className="mb-6">
          <Plus className="h-4 w-4 mr-2" />
          Add Debit Card
        </Button>
      )}

      {/* Add/Edit Form */}
      {showAddForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{editingCard ? "Edit Debit Card" : "Add New Debit Card"}</CardTitle>
            <CardDescription>Enter your debit card details for instant withdrawals</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="cardNumber">Card Number *</Label>
                <Input
                  id="cardNumber"
                  value={formData.cardNumber}
                  onChange={(e) => setFormData((prev) => ({ ...prev, cardNumber: formatCardNumber(e.target.value) }))}
                  placeholder="1234 5678 9012 3456"
                  maxLength={19}
                  className={errors.cardNumber ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}
                />
                {errors.cardNumber && <p className="text-sm text-red-600 mt-1">{errors.cardNumber}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="expiryMonth">Expiry Month *</Label>
                  <Select
                    value={formData.expiryMonth}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, expiryMonth: value }))}
                  >
                    <SelectTrigger
                      className={errors.expiryMonth ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}
                    >
                      <SelectValue placeholder="Month" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                        <SelectItem key={month} value={month.toString().padStart(2, "0")}>
                          {month.toString().padStart(2, "0")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.expiryMonth && <p className="text-sm text-red-600 mt-1">{errors.expiryMonth}</p>}
                </div>

                <div>
                  <Label htmlFor="expiryYear">Expiry Year *</Label>
                  <Select
                    value={formData.expiryYear}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, expiryYear: value }))}
                  >
                    <SelectTrigger
                      className={errors.expiryYear ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}
                    >
                      <SelectValue placeholder="Year" />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.expiryYear && <p className="text-sm text-red-600 mt-1">{errors.expiryYear}</p>}
                </div>

                <div>
                  <Label htmlFor="cvv">CVV *</Label>
                  <Input
                    id="cvv"
                    type="password"
                    value={formData.cvv}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, cvv: e.target.value.replace(/\D/g, "").slice(0, 4) }))
                    }
                    placeholder="123"
                    maxLength={4}
                    className={errors.cvv ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}
                  />
                  {errors.cvv && <p className="text-sm text-red-600 mt-1">{errors.cvv}</p>}
                </div>
              </div>

              <div>
                <Label htmlFor="cardholderName">Cardholder Name *</Label>
                <Input
                  id="cardholderName"
                  value={formData.cardholderName}
                  onChange={(e) => setFormData((prev) => ({ ...prev, cardholderName: e.target.value }))}
                  placeholder="Name as it appears on card"
                  className={errors.cardholderName ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}
                />
                {errors.cardholderName && <p className="text-sm text-red-600 mt-1">{errors.cardholderName}</p>}
              </div>

              <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-800 dark:text-amber-200">
                  Only debit cards are accepted for instant withdrawals. Credit cards cannot be used for fund transfers.
                </AlertDescription>
              </Alert>

              <div className="flex gap-3 pt-4">
                <Button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
                  {isLoading ? "Saving..." : editingCard ? "Update Card" : "Add Card"}
                </Button>
                <Button type="button" variant="outline" onClick={cancelForm} disabled={isLoading}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Information Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Instant Withdrawal Benefits</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <Zap className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="font-medium">Lightning Fast</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Funds available in minutes</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Check className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium">24/7 Availability</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Withdraw anytime, even weekends</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-blue-600" />
              <div>
                <p className="font-medium">Secure Transfers</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Bank-level security protection</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Fees & Limits</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="font-medium">Instant Withdrawal Fee</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">1.5% (min $0.25, max $15)</p>
            </div>
            <div>
              <p className="font-medium">Daily Limit</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">$5,000 per day</p>
            </div>
            <div>
              <p className="font-medium">Minimum Amount</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">$1.00</p>
            </div>
            <div>
              <p className="font-medium">Supported Cards</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Visa, Mastercard debit cards</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
