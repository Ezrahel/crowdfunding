"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, Check, Edit, ExternalLink, Plus, Trash2, X, Shield, Globe, Zap } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface PayPalAccount {
  id: string
  email: string
  accountType: "personal" | "business"
  isVerified: boolean
  isPrimary: boolean
  addedDate: string
  lastUsed?: string
  businessName?: string
  isConnectedViaOAuth: boolean
  paypalId?: string
}

let accountIdCounter = 3

export function PayPalSettings() {
  const [accounts, setAccounts] = useState<PayPalAccount[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingAccount, setEditingAccount] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [showOAuthDialog, setShowOAuthDialog] = useState(false)
  const [oauthStep, setOAuthStep] = useState<"connecting" | "authorizing" | "success" | "error">("connecting")
  const [formData, setFormData] = useState({
    email: "",
    accountType: "personal" as "personal" | "business",
    businessName: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Initialize with stable data to avoid hydration issues
  useEffect(() => {
    setAccounts([
      {
        id: "paypal-1",
        email: "john.doe@example.com",
        accountType: "personal",
        isVerified: true,
        isPrimary: true,
        addedDate: "2024-01-15",
        lastUsed: "2024-01-20",
        isConnectedViaOAuth: true,
        paypalId: "PP_USER_123456789",
      },
      {
        id: "paypal-2",
        email: "business@company.com",
        accountType: "business",
        isVerified: false,
        isPrimary: false,
        addedDate: "2024-01-10",
        businessName: "My Company LLC",
        isConnectedViaOAuth: false,
      },
    ])
  }, [])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.email.trim()) {
      newErrors.email = "PayPal email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address"
    }

    if (formData.accountType === "business" && !formData.businessName.trim()) {
      newErrors.businessName = "Business name is required for business accounts"
    }

    // Check for duplicate email
    const existingAccount = accounts.find(
      (account) => account.email.toLowerCase() === formData.email.toLowerCase() && account.id !== editingAccount,
    )
    if (existingAccount) {
      newErrors.email = "This PayPal account is already added"
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

    if (editingAccount) {
      // Update existing account
      setAccounts((prev) =>
        prev.map((account) =>
          account.id === editingAccount
            ? {
                ...account,
                email: formData.email,
                accountType: formData.accountType,
                businessName: formData.accountType === "business" ? formData.businessName : undefined,
                isVerified: false, // Re-verification needed after edit
              }
            : account,
        ),
      )
    } else {
      // Add new account
      const newAccount: PayPalAccount = {
        id: `paypal-${accountIdCounter++}`,
        email: formData.email,
        accountType: formData.accountType,
        businessName: formData.accountType === "business" ? formData.businessName : undefined,
        isVerified: false,
        isPrimary: accounts.length === 0,
        addedDate: new Date().toISOString().split("T")[0],
        isConnectedViaOAuth: false,
      }
      setAccounts((prev) => [...prev, newAccount])
    }

    // Reset form
    setFormData({
      email: "",
      accountType: "personal",
      businessName: "",
    })
    setShowAddForm(false)
    setEditingAccount(null)
    setIsLoading(false)
  }

  const handleConnectPayPal = async () => {
    setIsConnecting(true)
    setShowOAuthDialog(true)
    setOAuthStep("connecting")

    // Simulate OAuth flow steps
    try {
      // Step 1: Connecting to PayPal
      await new Promise((resolve) => setTimeout(resolve, 1500))
      setOAuthStep("authorizing")

      // Step 2: User authorization (simulate user interaction)
      await new Promise((resolve) => setTimeout(resolve, 2500))
      setOAuthStep("success")

      // Step 3: Account connected successfully
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Add connected account
      const connectedAccount: PayPalAccount = {
        id: `paypal-oauth-${accountIdCounter++}`,
        email: "connected.user@paypal.com",
        accountType: "personal",
        isVerified: true,
        isPrimary: accounts.length === 0,
        addedDate: new Date().toISOString().split("T")[0],
        isConnectedViaOAuth: true,
        paypalId: `PP_USER_${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      }

      setAccounts((prev) => [...prev, connectedAccount])

      // Close dialog after success
      setTimeout(() => {
        setShowOAuthDialog(false)
        setIsConnecting(false)
      }, 1500)
    } catch (error) {
      setOAuthStep("error")
      setTimeout(() => {
        setShowOAuthDialog(false)
        setIsConnecting(false)
      }, 2000)
    }
  }

  const handleEdit = (account: PayPalAccount) => {
    setFormData({
      email: account.email,
      accountType: account.accountType,
      businessName: account.businessName || "",
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

  const handleDisconnect = async (accountId: string) => {
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))

    setAccounts((prev) =>
      prev.map((account) =>
        account.id === accountId
          ? { ...account, isConnectedViaOAuth: false, paypalId: undefined, isVerified: false }
          : account,
      ),
    )
    setIsLoading(false)
  }

  const cancelForm = () => {
    setShowAddForm(false)
    setEditingAccount(null)
    setFormData({
      email: "",
      accountType: "personal",
      businessName: "",
    })
    setErrors({})
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">PayPal Settings</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Connect your PayPal account to receive campaign funds instantly
        </p>
      </div>

      {/* PayPal Connect Button */}
      <Card className="mb-6 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 border-blue-200 dark:border-blue-800">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">PP</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">Connect with PayPal</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Securely connect your PayPal account for instant verification
                </p>
              </div>
            </div>
            <Button onClick={handleConnectPayPal} disabled={isConnecting} className="bg-blue-600 hover:bg-blue-700">
              {isConnecting ? "Connecting..." : "Connect PayPal"}
              <ExternalLink className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* OAuth Dialog */}
      <Dialog open={showOAuthDialog} onOpenChange={setShowOAuthDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                <span className="text-white font-bold text-sm">PP</span>
              </div>
              PayPal Connection
            </DialogTitle>
            <DialogDescription>
              {oauthStep === "connecting" && "Connecting to PayPal..."}
              {oauthStep === "authorizing" && "Please authorize the connection in the PayPal window"}
              {oauthStep === "success" && "Successfully connected to PayPal!"}
              {oauthStep === "error" && "Connection failed. Please try again."}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col items-center py-6">
            {oauthStep === "connecting" && (
              <div className="flex flex-col items-center gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Establishing secure connection...</p>
              </div>
            )}

            {oauthStep === "authorizing" && (
              <div className="flex flex-col items-center gap-4">
                <div className="animate-pulse">
                  <ExternalLink className="h-12 w-12 text-blue-600" />
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                  A PayPal authorization window should have opened.
                  <br />
                  Please complete the authorization process.
                </p>
              </div>
            )}

            {oauthStep === "success" && (
              <div className="flex flex-col items-center gap-4">
                <div className="rounded-full bg-green-100 dark:bg-green-900/30 p-3">
                  <Check className="h-12 w-12 text-green-600" />
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                  Your PayPal account has been successfully connected!
                </p>
              </div>
            )}

            {oauthStep === "error" && (
              <div className="flex flex-col items-center gap-4">
                <div className="rounded-full bg-red-100 dark:bg-red-900/30 p-3">
                  <X className="h-12 w-12 text-red-600" />
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                  Connection failed. Please try again or add your account manually.
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Existing Accounts */}
      <div className="space-y-4 mb-8">
        {accounts.map((account) => (
          <Card key={account.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
                      <span className="text-white font-bold text-xs">PP</span>
                    </div>
                  </div>
                  <div>
                    <CardTitle className="text-lg">{account.email}</CardTitle>
                    <CardDescription className="capitalize flex items-center gap-2">
                      {account.accountType} Account
                      {account.businessName && ` • ${account.businessName}`}
                      {account.isConnectedViaOAuth && (
                        <Badge
                          variant="outline"
                          className="text-xs border-blue-300 text-blue-700 dark:border-blue-700 dark:text-blue-400"
                        >
                          <Shield className="h-3 w-3 mr-1" />
                          OAuth Connected
                        </Badge>
                      )}
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
                  <Label className="text-sm text-gray-600 dark:text-gray-400">Account Type</Label>
                  <p className="font-medium capitalize">{account.accountType}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-600 dark:text-gray-400">Added</Label>
                  <p className="font-medium">{formatDate(account.addedDate)}</p>
                </div>
                {account.lastUsed && (
                  <div>
                    <Label className="text-sm text-gray-600 dark:text-gray-400">Last Used</Label>
                    <p className="font-medium">{formatDate(account.lastUsed)}</p>
                  </div>
                )}
                {account.businessName && (
                  <div>
                    <Label className="text-sm text-gray-600 dark:text-gray-400">Business Name</Label>
                    <p className="font-medium">{account.businessName}</p>
                  </div>
                )}
                {account.paypalId && (
                  <div>
                    <Label className="text-sm text-gray-600 dark:text-gray-400">PayPal ID</Label>
                    <p className="font-medium font-mono text-sm">{account.paypalId}</p>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {!account.isVerified && !account.isConnectedViaOAuth && (
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
                {!account.isConnectedViaOAuth && (
                  <Button size="sm" variant="outline" onClick={() => handleEdit(account)}>
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                )}
                {account.isConnectedViaOAuth && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDisconnect(account.id)}
                    disabled={isLoading}
                    className="text-orange-600 border-orange-300 hover:bg-orange-50 dark:text-orange-400 dark:border-orange-700 dark:hover:bg-orange-950/20"
                  >
                    {isLoading ? "Disconnecting..." : "Disconnect"}
                  </Button>
                )}
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
        <Button onClick={() => setShowAddForm(true)} variant="outline" className="mb-6">
          <Plus className="h-4 w-4 mr-2" />
          Add PayPal Account Manually
        </Button>
      )}

      {/* Add/Edit Form */}
      {showAddForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{editingAccount ? "Edit PayPal Account" : "Add PayPal Account"}</CardTitle>
            <CardDescription>Enter your PayPal account details to receive campaign funds</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email">PayPal Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                  placeholder="your-email@example.com"
                  className={errors.email ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}
                />
                {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email}</p>}
              </div>

              <div>
                <Label>Account Type *</Label>
                <div className="flex gap-4 mt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="accountType"
                      value="personal"
                      checked={formData.accountType === "personal"}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, accountType: e.target.value as "personal" | "business" }))
                      }
                      className="text-blue-600"
                    />
                    <span>Personal</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="accountType"
                      value="business"
                      checked={formData.accountType === "business"}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, accountType: e.target.value as "personal" | "business" }))
                      }
                      className="text-blue-600"
                    />
                    <span>Business</span>
                  </label>
                </div>
              </div>

              {formData.accountType === "business" && (
                <div>
                  <Label htmlFor="businessName">Business Name *</Label>
                  <Input
                    id="businessName"
                    value={formData.businessName}
                    onChange={(e) => setFormData((prev) => ({ ...prev, businessName: e.target.value }))}
                    placeholder="Your business name"
                    className={errors.businessName ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}
                  />
                  {errors.businessName && <p className="text-sm text-red-600 mt-1">{errors.businessName}</p>}
                </div>
              )}

              <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-800">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800 dark:text-blue-200">
                  Make sure this email matches your PayPal account exactly. You'll need to verify ownership before
                  receiving payments.
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
            <CardTitle className="text-lg flex items-center gap-2">
              <Zap className="h-5 w-5 text-blue-600" />
              PayPal Benefits
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <Check className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium">Instant Transfers</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Receive funds immediately</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Globe className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium">Global Reach</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Accept donations worldwide</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium">Buyer Protection</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Built-in fraud protection</p>
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
              <p className="font-medium">Transaction Fee</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">2.9% + $0.30 per transaction</p>
            </div>
            <div>
              <p className="font-medium">Withdrawal Limit</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">$10,000 per transaction</p>
            </div>
            <div>
              <p className="font-medium">Processing Time</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Instant to PayPal balance</p>
            </div>
            <div>
              <p className="font-medium">Currency Support</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">25+ currencies supported</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
