"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Heart, Share2, Download, ArrowRight, CheckCircle, Sparkles, Users } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"

interface DonationSuccessPageProps {
  donationId: string
}

export function DonationSuccessPage({ donationId }: DonationSuccessPageProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [confettiVisible, setConfettiVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
    setTimeout(() => setConfettiVisible(true), 500)
  }, [])

  // Mock donation data
  const donation = {
    id: donationId,
    amount: 50,
    tip: 2.5,
    total: 52.5,
    campaign: "Help Build Clean Water Wells in Rural Communities",
    organizer: "Sarah Johnson",
    date: new Date().toLocaleDateString(),
    time: new Date().toLocaleTimeString(),
    receiptId: "RCP-2024-001234",
    paymentMethod: "Visa ****1234",
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-blue-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Confetti Animation */}
      {confettiVisible && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className={`absolute w-3 h-3 rounded-full animate-confetti opacity-80`}
              style={{
                left: `${Math.random() * 100}%`,
                backgroundColor: ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6"][Math.floor(Math.random() * 5)],
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${3 + Math.random() * 2}s`,
              }}
            />
          ))}
        </div>
      )}

      <div className="relative w-full max-w-2xl">
        <Card
          className={`border-0 shadow-2xl bg-white/95 backdrop-blur-sm transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-8 scale-95"}`}
        >
          <CardContent className="p-8 lg:p-12 text-center">
            {/* Success Animation */}
            <div className="mb-8">
              <div className="relative mx-auto w-32 h-32 lg:w-40 lg:h-40">
                {/* Animated Heart */}
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-100 to-green-100 rounded-full flex items-center justify-center shadow-lg animate-success-pulse">
                  <Heart className="w-16 h-16 lg:w-20 lg:h-20 text-emerald-600 fill-current animate-heart-beat" />
                </div>

                {/* Success Checkmark */}
                <div className="absolute -top-2 -right-2 w-12 h-12 bg-emerald-600 rounded-full flex items-center justify-center shadow-lg animate-check-appear">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>

                {/* Sparkle Effects */}
                <div className="absolute -top-1 -left-3 w-6 h-6 bg-yellow-300 rounded-full animate-sparkle-success opacity-80">
                  <Sparkles className="w-4 h-4 text-yellow-600 m-1" />
                </div>
                <div className="absolute -bottom-2 -right-1 w-5 h-5 bg-blue-300 rounded-full animate-sparkle-success-delayed opacity-80">
                  <Sparkles className="w-3 h-3 text-blue-600 m-1" />
                </div>
              </div>
            </div>

            {/* Success Message */}
            <div
              className={`transition-all duration-1000 delay-300 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
            >
              <Badge variant="secondary" className="mb-4 px-4 py-2 text-sm font-medium bg-emerald-100 text-emerald-700">
                Donation Successful
              </Badge>

              <h1 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-4 leading-tight">
                Thank you for your{" "}
                <span className="bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                  generous donation!
                </span>
              </h1>

              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Your contribution makes a real difference. You've just helped bring this campaign one step closer to its
                goal.
              </p>
            </div>

            {/* Donation Summary */}
            <div
              className={`transition-all duration-1000 delay-500 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
            >
              <Card className="bg-emerald-50 border-emerald-200 mb-8">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-emerald-800 mb-4 flex items-center justify-center">
                    <Heart className="w-5 h-5 mr-2" />
                    Donation Summary
                  </h3>

                  <div className="space-y-3 text-left">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Campaign:</span>
                      <span className="font-medium text-gray-900 text-right max-w-xs">{donation.campaign}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Organizer:</span>
                      <span className="font-medium text-gray-900">{donation.organizer}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Donation Amount:</span>
                      <span className="font-medium text-gray-900">${donation.amount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Platform Tip:</span>
                      <span className="font-medium text-gray-900">${donation.tip.toFixed(2)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between items-center text-lg">
                      <span className="font-semibold text-gray-900">Total Paid:</span>
                      <span className="font-bold text-emerald-600">${donation.total.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-emerald-200 text-sm text-emerald-700">
                    <div className="flex justify-between">
                      <span>Receipt ID:</span>
                      <span className="font-mono">{donation.receiptId}</span>
                    </div>
                    <div className="flex justify-between mt-1">
                      <span>Date & Time:</span>
                      <span>
                        {donation.date} at {donation.time}
                      </span>
                    </div>
                    <div className="flex justify-between mt-1">
                      <span>Payment Method:</span>
                      <span>{donation.paymentMethod}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Impact Message */}
            <div
              className={`bg-blue-50 rounded-xl p-6 mb-8 transition-all duration-1000 delay-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
            >
              <div className="flex items-center justify-center mb-3">
                <Users className="w-6 h-6 text-blue-600 mr-2" />
                <h3 className="font-semibold text-blue-800">Your Impact</h3>
              </div>
              <p className="text-blue-700 text-sm">
                With your ${donation.amount} donation, you've helped provide clean water access for approximately 2
                families. You're part of a community of 1,247 supporters who believe in this cause.
              </p>
            </div>

            {/* Action Buttons */}
            <div
              className={`space-y-4 transition-all duration-1000 delay-900 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
            >
              <div className="flex flex-col sm:flex-row gap-4">
                <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-lg py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group">
                  <Share2 className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                  Share This Campaign
                </Button>

                <Button
                  variant="outline"
                  className="flex-1 text-lg py-3 rounded-xl border-2 hover:bg-gray-50 transition-all duration-300 group"
                >
                  <Download className="w-5 h-5 mr-2 group-hover:translate-y-[-2px] transition-transform" />
                  Download Receipt
                </Button>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button asChild variant="ghost" className="flex-1 text-gray-600 hover:text-gray-900">
                  <Link href="/dashboard">Go to Dashboard</Link>
                </Button>

                <Button asChild variant="ghost" className="flex-1 text-gray-600 hover:text-gray-900 group">
                  <Link href="/explore">
                    Explore More Campaigns
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </div>
            </div>

            {/* Thank You Note */}
            <div
              className={`mt-8 pt-6 border-t border-gray-200 transition-all duration-1000 delay-1100 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
            >
              <p className="text-sm text-gray-500">
                A confirmation email has been sent to your inbox. Thank you for making a difference! 💚
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        @keyframes confetti {
          0% { transform: translateY(-100vh) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
        
        @keyframes success-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        
        @keyframes heart-beat {
          0%, 100% { transform: scale(1); }
          25% { transform: scale(1.1); }
          50% { transform: scale(1); }
          75% { transform: scale(1.05); }
        }
        
        @keyframes check-appear {
          0% { transform: scale(0) rotate(-180deg); opacity: 0; }
          50% { transform: scale(1.2) rotate(0deg); opacity: 1; }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        
        @keyframes sparkle-success {
          0%, 100% { transform: scale(0.8) rotate(0deg); opacity: 0.8; }
          50% { transform: scale(1.3) rotate(180deg); opacity: 1; }
        }
        
        @keyframes sparkle-success-delayed {
          0%, 100% { transform: scale(0.9) rotate(0deg); opacity: 0.6; }
          50% { transform: scale(1.2) rotate(-180deg); opacity: 1; }
        }
        
        .animate-confetti { animation: confetti linear infinite; }
        .animate-success-pulse { animation: success-pulse 3s ease-in-out infinite; }
        .animate-heart-beat { animation: heart-beat 2s ease-in-out infinite; }
        .animate-check-appear { animation: check-appear 1s ease-out 0.8s both; }
        .animate-sparkle-success { animation: sparkle-success 2s ease-in-out infinite; }
        .animate-sparkle-success-delayed { animation: sparkle-success-delayed 3s ease-in-out infinite; }
      `}</style>
    </div>
  )
}
