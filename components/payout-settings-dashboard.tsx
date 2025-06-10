"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { CreditCard, Plus, Edit3, Trash2, AlertCircle, Clock, DollarSign, Shield, CheckCircle } from "lucide-react"

interface PayoutMethod {
  id: string
  type: "bank" | "paypal"
  name: string
  details: string
  isPreferred: boolean
  isVerified: boolean
}

export function PayoutSettingsDashboard() {
  const [payoutMethods, setPayoutMethods] = useState<PayoutMethod[]>([
    {
      id: "1",
      type: "bank",
      name: "Chase Bank",
      details: "****1234",
      isPreferred: true,
      isVerified: true,
    },
    {
      id: "2",
      type: "paypal",
      name: "PayPal",
      details: "j***@email.com",
      isPreferred: false,
      isVerified: true,
    },
  ])

  const togglePreferred = (id: string) => {
    setPayoutMethods((methods) =>
      methods.map((method) => ({
        ...method,
        isPreferred: method.id === id,
      })),
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Payout Settings</h1>
          <p className="text-gray-600">Manage your withdrawal methods and payout preferences</p>
        </div>

        <div className="grid gap-6">
          {/* Current Balance Card */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Available Balance
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-gray-900 mb-2">$2,847.50</div>
              <p className="text-gray-600 text-sm">Ready for withdrawal</p>
              <Button className="mt-4 bg-emerald-600 hover:bg-emerald-700">Withdraw Funds</Button>
            </CardContent>
          </Card>

          {/* Payout Methods */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Payout Methods</CardTitle>
                  <CardDescription>Manage your connected withdrawal methods</CardDescription>
                </div>
                <Button className="bg-emerald-600 hover:bg-emerald-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Method
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {payoutMethods.map((method) => (
                <div key={method.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <CreditCard className="h-5 w-5 text-gray-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-gray-900">{method.name}</h3>
                          {method.isVerified && <CheckCircle className="h-4 w-4 text-emerald-500" />}
                          {method.isPreferred && (
                            <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
                              Preferred
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{method.details}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">Preferred</span>
                        <Switch checked={method.isPreferred} onCheckedChange={() => togglePreferred(method.id)} />
                      </div>
                      <Button variant="ghost" size="sm">
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Payout Information */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-blue-600" />
                Payout Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
                  <Clock className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900">Payout Schedule</h4>
                    <p className="text-sm text-blue-700">
                      Funds are processed every Tuesday and Friday. Allow 2-5 business days for bank transfers.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-lg">
                  <DollarSign className="h-5 w-5 text-amber-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-amber-900">Processing Fees</h4>
                    <p className="text-sm text-amber-700">
                      Bank transfers: $0.25 per transaction. PayPal: 1% of withdrawal amount.
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                <Shield className="h-5 w-5 text-gray-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-gray-900">Security & Verification</h4>
                  <p className="text-sm text-gray-600">
                    All payout methods must be verified before use. We use bank-level encryption to protect your
                    financial information.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
