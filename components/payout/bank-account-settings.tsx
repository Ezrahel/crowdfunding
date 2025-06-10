"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, Building2, Check, Edit, Plus, Shield, Trash2, X } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

// Add this at the top of the component, outside the component function
let accountIdCounter = 3

interface BankAccount {
  id: string
  bankName: string
  accountType: string
  accountNumber: string
  routingNumber: string
  accountHolderName: string
  isVerified: boolean
  isPrimary: boolean
  addedDate: string
  lastUsed?: string
}

export function BankAccountSettings() {
  const [accounts, setAccounts] = useState<BankAccount[]>([
    {
      id: "account_1",
      bankName: "Chase Bank",
      accountType: "Checking",
      accountNumber: "****1234",
      routingNumber: "021000021",
      accountHolderName: "John Doe",
      isVerified: true,
      isPrimary: true,
      addedDate: "Jan 15, 2024",
      lastUsed: "Jan 20, 2024",
    },
    {
      id: "account_2",
      bankName: "Bank of America",
      accountType: "Savings",
      accountNumber: "****5678",
      routingNumber: "026009593",
      accountHolderName: "John Doe",
      isVerified: false,
      isPrimary: false,
      addedDate: "Jan 10, 2024",
    },
  ])

  const [showAddForm, setShowAddForm] = useState(false)
  const [editingAccount, setEditingAccount] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    bankName: "",
    accountType: "",
    accountNumber: "",
    routingNumber: "",
    accountHolderName: "",
    confirmAccountNumber: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.bankName.trim()) newErrors.bankName = "Bank name is required"
    if (!formData.accountType) newErrors.accountType = "Account type is required"
    if (!formData.accountNumber.trim()) newErrors.accountNumber = "Account number is required"
    if (!formData.confirmAccountNumber.trim()) newErrors.confirmAccountNumber = "Please confirm account number"
    if (formData.accountNumber !== formData.confirmAccountNumber) {
      newErrors.confirmAccountNumber = "Account numbers do not match"
    }
    if (!formData.routingNumber.trim()) newErrors.routingNumber = "Routing number is required"
    if (formData.routingNumber.length !== 9) newErrors.routingNumber = "Routing number must be 9 digits"
    if (!formData.accountHolderName.trim()) newErrors.accountHolderName = "Account holder name is required"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsLoading(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000))

    if (editingAccount) {
      // Update existing account
      setAccounts((prev) =>
        prev.map((account) =>
          account.id === editingAccount
            ? {
                ...account,
                bankName: formData.bankName,
                accountType: formData.accountType,
                accountNumber: `****${formData.accountNumber.slice(-4)}`,
                routingNumber: formData.routingNumber,
                accountHolderName: formData.accountHolderName,
                isVerified: false, // Re-verification needed after edit
              }
            : account,
        ),
      )
    } else {
      // Add new account
      const newAccount: BankAccount = {
        id: `account_${accountIdCounter++}`,
        bankName: formData.bankName,
        accountType: formData.accountType,
        accountNumber: `****${formData.accountNumber.slice(-4)}`,
        routingNumber: formData.routingNumber,
        accountHolderName: formData.accountHolderName,
        isVerified: false,
        isPrimary: accounts.length === 0,
        addedDate: new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        }),
      }
      setAccounts((prev) => [...prev, newAccount])
    }

    // Reset form
    setFormData({
      bankName: "",
      accountType: "",
      accountNumber: "",
      routingNumber: "",
      accountHolderName: "",
      confirmAccountNumber: "",
    })
    setShowAddForm(false)
    setEditingAccount(null)
    setIsLoading(false)
  }

  const handleEdit = (account: BankAccount) => {
    setFormData({
      bankName: account.bankName,
      accountType: account.accountType,
      accountNumber: "",
      routingNumber: account.routingNumber,
      accountHolderName: account.accountHolderName,
      confirmAccountNumber: "",
    })
    setEditingAccount(account.id)
    setShowAddForm(true)
  }

  const handleDelete = (accountId: string) => {
    setAccounts((prev) => prev.filter((account) => account.id !== accountId))
  }

  const handleSetPrimary = (accountId: string) => {
    setAccounts((prev) =>
      prev.map((account) => ({
        ...account,
        isPrimary: account.id === accountId,
      })),
    )
  }

  const handleVerify = async (accountId: string) => {
    setIsLoading(true)
    // Simulate verification process
    await new Promise((resolve) => setTimeout(resolve, 1500))

    setAccounts((prev) =>
      prev.map((account) => (account.id === accountId ? { ...account, isVerified: true } : account)),
    )
    setIsLoading(false)
  }

  const cancelForm = () => {
    setShowAddForm(false)
    setEditingAccount(null)
    setFormData({
      bankName: "",
      accountType: "",
      accountNumber: "",
      routingNumber: "",
      accountHolderName: "",
      confirmAccountNumber: "",
    })
    setErrors({})
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Bank Account Settings</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage your bank accounts for receiving campaign funds</p>
      </div>

      {/* Security Notice */}
      <Alert className="mb-6 border-blue-200 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-800">
        <Shield className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800 dark:text-blue-200">
          Your banking information is encrypted and secure. We use bank-level security to protect your data.
        </AlertDescription>
      </Alert>

      {/* Existing Accounts */}
      <div className="space-y-4 mb-8">
        {accounts.map((account) => (
          <Card key={account.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <Building2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{account.bankName}</CardTitle>
                    <CardDescription>
                      {account.accountType} • {account.accountNumber}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {account.isPrimary && (
                    <Badge
                      variant="default"
                      className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                    >
                      Primary
                    </Badge>
                  )}
                  {account.isVerified ? (
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
                  <Label className="text-sm text-gray-600 dark:text-gray-400">Account Holder</Label>
                  <p className="font-medium">{account.accountHolderName}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-600 dark:text-gray-400">Routing Number</Label>
                  <p className="font-medium">{account.routingNumber}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-600 dark:text-gray-400">Added</Label>
                  <p className="font-medium">{account.addedDate}</p>
                </div>
                {account.lastUsed && (
                  <div>
                    <Label className="text-sm text-gray-600 dark:text-gray-400">Last Used</Label>
                    <p className="font-medium">{account.lastUsed}</p>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {!account.isVerified && (
                  <Button
                    size="sm"
                    onClick={() => handleVerify(account.id)}
                    disabled={isLoading}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {isLoading ? "Verifying..." : "Verify Account"}
                  </Button>
                )}
                {!account.isPrimary && account.isVerified && (
                  <Button size="sm" variant="outline" onClick={() => handleSetPrimary(account.id)}>
                    Set as Primary
                  </Button>
                )}
                <Button size="sm" variant="outline" onClick={() => handleEdit(account)}>
                  <Edit className="h-3 w-3 mr-1" />
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDelete(account.id)}
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

      {/* Add New Account Button */}
      {!showAddForm && (
        <Button onClick={() => setShowAddForm(true)} className="mb-6">
          <Plus className="h-4 w-4 mr-2" />
          Add Bank Account
        </Button>
      )}

      {/* Add/Edit Form */}
      {showAddForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{editingAccount ? "Edit Bank Account" : "Add New Bank Account"}</CardTitle>
            <CardDescription>Enter your bank account details to receive campaign funds</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="bankName">Bank Name *</Label>
                  <Input
                    id="bankName"
                    value={formData.bankName}
                    onChange={(e) => setFormData((prev) => ({ ...prev, bankName: e.target.value }))}
                    placeholder="e.g., Chase Bank"
                    className={errors.bankName ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}
                  />
                  {errors.bankName && <p className="text-sm text-red-600 mt-1">{errors.bankName}</p>}
                </div>

                <div>
                  <Label htmlFor="accountType">Account Type *</Label>
                  <Select
                    value={formData.accountType}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, accountType: value }))}
                  >
                    <SelectTrigger
                      className={errors.accountType ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}
                    >
                      <SelectValue placeholder="Select account type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="checking">Checking</SelectItem>
                      <SelectItem value="savings">Savings</SelectItem>
                      <SelectItem value="business">Business</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.accountType && <p className="text-sm text-red-600 mt-1">{errors.accountType}</p>}
                </div>
              </div>

              <div>
                <Label htmlFor="accountHolderName">Account Holder Name *</Label>
                <Input
                  id="accountHolderName"
                  value={formData.accountHolderName}
                  onChange={(e) => setFormData((prev) => ({ ...prev, accountHolderName: e.target.value }))}
                  placeholder="Full name as it appears on your account"
                  className={errors.accountHolderName ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}
                />
                {errors.accountHolderName && <p className="text-sm text-red-600 mt-1">{errors.accountHolderName}</p>}
              </div>

              <div>
                <Label htmlFor="routingNumber">Routing Number *</Label>
                <Input
                  id="routingNumber"
                  value={formData.routingNumber}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, routingNumber: e.target.value.replace(/\D/g, "").slice(0, 9) }))
                  }
                  placeholder="9-digit routing number"
                  className={errors.routingNumber ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}
                />
                {errors.routingNumber && <p className="text-sm text-red-600 mt-1">{errors.routingNumber}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="accountNumber">Account Number *</Label>
                  <Input
                    id="accountNumber"
                    type="password"
                    value={formData.accountNumber}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, accountNumber: e.target.value.replace(/\D/g, "") }))
                    }
                    placeholder="Enter account number"
                    className={errors.accountNumber ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}
                  />
                  {errors.accountNumber && <p className="text-sm text-red-600 mt-1">{errors.accountNumber}</p>}
                </div>

                <div>
                  <Label htmlFor="confirmAccountNumber">Confirm Account Number *</Label>
                  <Input
                    id="confirmAccountNumber"
                    type="password"
                    value={formData.confirmAccountNumber}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, confirmAccountNumber: e.target.value.replace(/\D/g, "") }))
                    }
                    placeholder="Re-enter account number"
                    className={
                      errors.confirmAccountNumber ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""
                    }
                  />
                  {errors.confirmAccountNumber && (
                    <p className="text-sm text-red-600 mt-1">{errors.confirmAccountNumber}</p>
                  )}
                </div>
              </div>

              <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-800 dark:text-amber-200">
                  New bank accounts require verification before they can be used for withdrawals. This process typically
                  takes 1-2 business days.
                </AlertDescription>
              </Alert>

              <div className="flex gap-3 pt-4">
                <Button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
                  {isLoading ? "Saving..." : editingAccount ? "Update Account" : "Add Account"}
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
            <CardTitle className="text-lg">Verification Process</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">1</span>
              </div>
              <div>
                <p className="font-medium">Add Account Details</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Enter your bank account information</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">2</span>
              </div>
              <div>
                <p className="font-medium">Micro-deposits</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  We'll send small deposits to verify your account
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">3</span>
              </div>
              <div>
                <p className="font-medium">Confirm Amounts</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Enter the deposit amounts to complete verification
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Security & Privacy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium">Bank-level Encryption</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">256-bit SSL encryption protects your data</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Check className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium">PCI Compliant</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Meets industry security standards</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-blue-600" />
              <div>
                <p className="font-medium">Never Stored</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Full account numbers are never saved</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
