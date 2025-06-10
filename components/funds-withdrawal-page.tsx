"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  ArrowLeft,
  DollarSign,
  CreditCard,
  Clock,
  CheckCircle,
  Info,
  Download,
  Eye,
  Calendar,
  TrendingUp,
  Shield,
  Building,
  Smartphone,
} from "lucide-react"
import { Banknote } from "lucide-react"

export function FundsWithdrawalPage() {
  const [withdrawalAmount, setWithdrawalAmount] = useState("")
  const [withdrawalMethod, setWithdrawalMethod] = useState("bank")
  const [selectedCampaign, setSelectedCampaign] = useState("all")

  // Mock data
  const accountBalance = {
    total: 45750.25,
    available: 42300.75,
    pending: 3449.5,
    processing: 0,
  }

  const campaigns = [
    {
      id: "1",
      title: "Help Sarah's Medical Treatment",
      raised: 32500,
      available: 30800,
      pending: 1700,
      status: "active",
    },
    {
      id: "2",
      title: "Community Garden Project",
      raised: 13250,
      available: 11500,
      pending: 1750,
      status: "completed",
    },
  ]

  const withdrawalHistory = [
    {
      id: "1",
      amount: 5000,
      method: "Bank Transfer",
      status: "completed",
      date: "2024-01-15",
      campaign: "Help Sarah's Medical Treatment",
      fee: 0,
      net: 5000,
    },
    {
      id: "2",
      amount: 2500,
      method: "PayPal",
      status: "processing",
      date: "2024-01-10",
      campaign: "Community Garden Project",
      fee: 25,
      net: 2475,
    },
    {
      id: "3",
      amount: 1000,
      method: "Bank Transfer",
      status: "completed",
      date: "2024-01-05",
      campaign: "Help Sarah's Medical Treatment",
      fee: 0,
      net: 1000,
    },
  ]

  const paymentMethods = [
    {
      id: "bank",
      name: "Bank Account",
      icon: Building,
      description: "Direct deposit to your bank account",
      fee: "Free",
      time: "2-3 business days",
      details: "****1234 - Chase Bank",
    },
    {
      id: "paypal",
      name: "PayPal",
      icon: CreditCard,
      description: "Transfer to your PayPal account",
      fee: "1% (max $10)",
      time: "1-2 business days",
      details: "john.smith@email.com",
    },
    {
      id: "debit",
      name: "Debit Card",
      icon: Smartphone,
      description: "Instant transfer to your debit card",
      fee: "1.5%",
      time: "Within minutes",
      details: "****5678 - Visa Debit",
    },
  ]

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount)
  }

  const calculateFee = (amount: number, method: string) => {
    switch (method) {
      case "paypal":
        return Math.min(amount * 0.01, 10)
      case "debit":
        return amount * 0.015
      default:
        return 0
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "processing":
        return "bg-yellow-100 text-yellow-800"
      case "failed":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button asChild variant="ghost" className="text-gray-600 hover:text-gray-900">
              <Link href="/dashboard">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Withdraw Funds</h1>
              <p className="text-gray-600">Manage your campaign earnings and withdrawals</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Shield className="w-4 h-4 text-emerald-600" />
            <span>Bank-level Security</span>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Account Balance Overview */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <Banknote className="w-5 h-5 text-emerald-600 mr-3" />
                  Account Balance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center p-6 bg-emerald-50 rounded-xl">
                    <div className="text-3xl font-bold text-emerald-600 mb-2">
                      {formatCurrency(accountBalance.available)}
                    </div>
                    <div className="text-sm text-emerald-700 font-medium">Available to Withdraw</div>
                  </div>
                  <div className="text-center p-6 bg-blue-50 rounded-xl">
                    <div className="text-3xl font-bold text-blue-600 mb-2">
                      {formatCurrency(accountBalance.pending)}
                    </div>
                    <div className="text-sm text-blue-700 font-medium">Pending Clearance</div>
                  </div>
                  <div className="text-center p-6 bg-gray-50 rounded-xl">
                    <div className="text-3xl font-bold text-gray-600 mb-2">{formatCurrency(accountBalance.total)}</div>
                    <div className="text-sm text-gray-700 font-medium">Total Raised</div>
                  </div>
                </div>

                <Alert className="mt-6 border-blue-200 bg-blue-50">
                  <Info className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800">
                    Funds are available for withdrawal 2-5 business days after donation. Pending funds will become
                    available once the clearance period is complete.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            {/* Withdrawal Form */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <DollarSign className="w-5 h-5 text-blue-600 mr-3" />
                  Request Withdrawal
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Campaign Selection */}
                <div>
                  <Label htmlFor="campaign" className="text-base font-semibold">
                    Select Campaign
                  </Label>
                  <Select value={selectedCampaign} onValueChange={setSelectedCampaign}>
                    <SelectTrigger className="mt-2 h-12">
                      <SelectValue placeholder="Choose campaign" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Campaigns ({formatCurrency(accountBalance.available)})</SelectItem>
                      {campaigns.map((campaign) => (
                        <SelectItem key={campaign.id} value={campaign.id}>
                          {campaign.title} ({formatCurrency(campaign.available)})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Withdrawal Amount */}
                <div>
                  <Label htmlFor="amount" className="text-base font-semibold">
                    Withdrawal Amount
                  </Label>
                  <div className="relative mt-2">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <Input
                      id="amount"
                      type="number"
                      placeholder="0.00"
                      value={withdrawalAmount}
                      onChange={(e) => setWithdrawalAmount(e.target.value)}
                      className="pl-12 h-14 text-lg border-2 focus:border-blue-500"
                    />
                  </div>
                  <div className="flex justify-between mt-2 text-sm text-gray-600">
                    <span>Minimum: $25.00</span>
                    <button
                      onClick={() => setWithdrawalAmount(accountBalance.available.toString())}
                      className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Withdraw All ({formatCurrency(accountBalance.available)})
                    </button>
                  </div>
                </div>

                {/* Payment Method Selection */}
                <div>
                  <Label className="text-base font-semibold mb-4 block">Withdrawal Method</Label>
                  <div className="space-y-3">
                    {paymentMethods.map((method) => (
                      <div
                        key={method.id}
                        className={`p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                          withdrawalMethod === method.id
                            ? "border-blue-600 bg-blue-50"
                            : "border-gray-200 hover:border-blue-300"
                        }`}
                        onClick={() => setWithdrawalMethod(method.id)}
                      >
                        <div className="flex items-start space-x-4">
                          <div
                            className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                              withdrawalMethod === method.id ? "bg-blue-100" : "bg-gray-100"
                            }`}
                          >
                            <method.icon
                              className={`w-6 h-6 ${
                                withdrawalMethod === method.id ? "text-blue-600" : "text-gray-600"
                              }`}
                            />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="font-semibold text-gray-900">{method.name}</h4>
                              <div className="text-right">
                                <div className="text-sm font-medium text-gray-900">Fee: {method.fee}</div>
                                <div className="text-xs text-gray-600">{method.time}</div>
                              </div>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{method.description}</p>
                            <p className="text-xs text-gray-500">{method.details}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Withdrawal Summary */}
                {withdrawalAmount && (
                  <div className="bg-gray-50 p-6 rounded-xl">
                    <h4 className="font-semibold text-gray-900 mb-4">Withdrawal Summary</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Withdrawal amount:</span>
                        <span className="font-medium">{formatCurrency(Number.parseFloat(withdrawalAmount))}</span>
                      </div>
                      <div className="flex justify-between text-gray-600">
                        <span>Processing fee:</span>
                        <span>
                          {formatCurrency(calculateFee(Number.parseFloat(withdrawalAmount), withdrawalMethod))}
                        </span>
                      </div>
                      <Separator />
                      <div className="flex justify-between font-semibold text-lg">
                        <span>You'll receive:</span>
                        <span className="text-emerald-600">
                          {formatCurrency(
                            Number.parseFloat(withdrawalAmount) -
                              calculateFee(Number.parseFloat(withdrawalAmount), withdrawalMethod),
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <Button
                  className="w-full h-14 text-lg bg-blue-600 hover:bg-blue-700 shadow-lg"
                  disabled={!withdrawalAmount || Number.parseFloat(withdrawalAmount) < 25}
                >
                  <Download className="w-5 h-5 mr-2" />
                  Request Withdrawal
                </Button>
              </CardContent>
            </Card>

            {/* Withdrawal History */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Clock className="w-5 h-5 text-purple-600 mr-3" />
                    Withdrawal History
                  </div>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {withdrawalHistory.map((withdrawal) => (
                    <div
                      key={withdrawal.id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                          <DollarSign className="w-6 h-6 text-gray-600" />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{formatCurrency(withdrawal.amount)}</div>
                          <div className="text-sm text-gray-600">{withdrawal.method}</div>
                          <div className="text-xs text-gray-500">{withdrawal.campaign}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={getStatusColor(withdrawal.status)}>{withdrawal.status}</Badge>
                        <div className="text-sm text-gray-600 mt-1">{withdrawal.date}</div>
                        <div className="text-xs text-gray-500">Net: {formatCurrency(withdrawal.net)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Campaign Performance */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <TrendingUp className="w-5 h-5 text-emerald-600 mr-2" />
                  Campaign Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {campaigns.map((campaign) => (
                  <div key={campaign.id} className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">{campaign.title}</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Total raised:</span>
                        <span className="font-medium">{formatCurrency(campaign.raised)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Available:</span>
                        <span className="text-emerald-600 font-medium">{formatCurrency(campaign.available)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Pending:</span>
                        <span className="text-blue-600">{formatCurrency(campaign.pending)}</span>
                      </div>
                    </div>
                    <Badge variant={campaign.status === "active" ? "default" : "secondary"} className="mt-2 text-xs">
                      {campaign.status}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <Eye className="w-4 h-4 mr-2" />
                  View Tax Documents
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Download className="w-4 h-4 mr-2" />
                  Download Statements
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Manage Payment Methods
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Calendar className="w-4 h-4 mr-2" />
                  Schedule Withdrawals
                </Button>
              </CardContent>
            </Card>

            {/* Help & Support */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">Need Help?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-gray-600">
                  <p className="mb-3">Have questions about withdrawals or need assistance with your account?</p>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                      <span>24/7 customer support</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                      <span>Secure fund transfers</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                      <span>Detailed transaction history</span>
                    </div>
                  </div>
                </div>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/help">Contact Support</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
