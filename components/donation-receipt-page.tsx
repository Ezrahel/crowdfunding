"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Download, Heart, Calendar, User, DollarSign, CheckCircle, Share2, Mail } from "lucide-react"

interface DonationReceiptPageProps {
  receiptId: string
}

export function DonationReceiptPage({ receiptId }: DonationReceiptPageProps) {
  const receiptData = {
    id: receiptId,
    campaignTitle: "Help Build Clean Water Wells in Rural Communities",
    campaignId: "camp_123",
    donorName: "John Doe",
    isAnonymous: false,
    donationAmount: 50.0,
    tip: 2.5,
    processingFee: 1.75,
    totalPaid: 54.25,
    date: "March 15, 2024",
    time: "2:34 PM EST",
    paymentMethod: "Visa ****1234",
    transactionId: "txn_abc123def456",
    taxDeductible: true,
  }

  const handleDownload = () => {
    // Simulate PDF download
    console.log("Downloading receipt...")
  }

  const handleShare = () => {
    // Simulate sharing
    console.log("Sharing donation...")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="h-8 w-8 text-emerald-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Thank You!</h1>
          <p className="text-gray-600">Your donation has been successfully processed</p>
        </div>

        {/* Receipt Card */}
        <Card className="border-0 shadow-lg mb-6">
          <CardHeader className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5" />
              Donation Receipt
            </CardTitle>
            <p className="text-emerald-100">Receipt #{receiptData.id}</p>
          </CardHeader>
          <CardContent className="p-6">
            {/* Campaign Info */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-2">Campaign</h3>
              <p className="text-gray-700">{receiptData.campaignTitle}</p>
              <Badge variant="secondary" className="mt-2">
                Campaign ID: {receiptData.campaignId}
              </Badge>
            </div>

            <Separator className="my-6" />

            {/* Donor Info */}
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Donor Information
                </h3>
                <p className="text-gray-700">{receiptData.isAnonymous ? "Anonymous Donor" : receiptData.donorName}</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Date & Time
                </h3>
                <p className="text-gray-700">{receiptData.date}</p>
                <p className="text-gray-600 text-sm">{receiptData.time}</p>
              </div>
            </div>

            <Separator className="my-6" />

            {/* Payment Breakdown */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Payment Breakdown
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Donation Amount</span>
                  <span className="font-medium">${receiptData.donationAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tip to FundRaise</span>
                  <span className="font-medium">${receiptData.tip.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Processing Fee</span>
                  <span className="font-medium">${receiptData.processingFee.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total Paid</span>
                  <span>${receiptData.totalPaid.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <Separator className="my-6" />

            {/* Transaction Details */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">Transaction Details</h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Payment Method</span>
                  <span>{receiptData.paymentMethod}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Transaction ID</span>
                  <span className="font-mono">{receiptData.transactionId}</span>
                </div>
                {receiptData.taxDeductible && (
                  <div className="flex items-center gap-2 text-sm text-emerald-700 mt-3">
                    <CheckCircle className="h-4 w-4" />
                    <span>This donation is tax-deductible</span>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button onClick={handleDownload} className="flex-1 bg-emerald-600 hover:bg-emerald-700">
                <Download className="h-4 w-4 mr-2" />
                Download Receipt
              </Button>
              <Button onClick={handleShare} variant="outline" className="flex-1">
                <Share2 className="h-4 w-4 mr-2" />
                Share Donation
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Thank You Message */}
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6 text-center">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Your Generosity Makes a Difference</h3>
            <p className="text-gray-600 mb-4">
              Thank you for supporting this important cause. Your donation will help make a real impact in the lives of
              those who need it most.
            </p>
            <div className="flex justify-center gap-4">
              <Button variant="outline" size="sm">
                <Mail className="h-4 w-4 mr-2" />
                Email Receipt
              </Button>
              <Button variant="outline" size="sm">
                View Campaign
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
