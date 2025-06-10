"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Heart, Users, Globe, Sparkles } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"

export function WelcomeScreen() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50 flex items-center justify-center p-4 overflow-hidden">
      {/* Background Animation Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-2 h-2 bg-emerald-400 rounded-full animate-float opacity-60"></div>
        <div className="absolute top-40 right-20 w-3 h-3 bg-blue-400 rounded-full animate-float-delayed opacity-60"></div>
        <div className="absolute bottom-32 left-1/4 w-2 h-2 bg-purple-400 rounded-full animate-float opacity-60"></div>
        <div className="absolute bottom-20 right-1/3 w-4 h-4 bg-pink-400 rounded-full animate-float-delayed opacity-60"></div>
      </div>

      <div className="relative w-full max-w-4xl text-center">
        {/* Main Welcome Card */}
        <Card
          className={`border-0 shadow-2xl bg-white/90 backdrop-blur-sm transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
        >
          <CardContent className="p-8 lg:p-16">
            {/* Animated Welcome Icon */}
            <div className="mb-8">
              <div className="relative mx-auto w-32 h-32 lg:w-40 lg:h-40">
                {/* Waving Hand Animation */}
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-200 to-orange-200 rounded-full flex items-center justify-center shadow-lg animate-wave-container">
                  <div className="text-6xl lg:text-7xl animate-wave">👋</div>
                </div>

                {/* Sparkle Effects */}
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-300 rounded-full animate-sparkle opacity-80">
                  <Sparkles className="w-4 h-4 text-yellow-600 m-1" />
                </div>
                <div className="absolute -bottom-1 -left-3 w-4 h-4 bg-pink-300 rounded-full animate-sparkle-delayed opacity-80">
                  <Heart className="w-3 h-3 text-pink-600 m-0.5" />
                </div>
                <div className="absolute top-1/2 -right-4 w-5 h-5 bg-blue-300 rounded-full animate-sparkle opacity-80">
                  <Globe className="w-3 h-3 text-blue-600 m-1" />
                </div>
              </div>
            </div>

            {/* Welcome Content */}
            <div
              className={`transition-all duration-1000 delay-300 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
            >
              <Badge variant="secondary" className="mb-4 px-4 py-2 text-sm font-medium bg-emerald-100 text-emerald-700">
                Welcome to the Community
              </Badge>

              <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Welcome to{" "}
                <span className="bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
                  FundRaise
                </span>
              </h1>

              <p className="text-xl lg:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
                Join millions of people making a difference through the power of community-driven fundraising. Turn your
                ideas into reality and help others achieve their dreams.
              </p>
            </div>

            {/* Feature Highlights */}
            <div
              className={`grid md:grid-cols-3 gap-6 mb-10 transition-all duration-1000 delay-500 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
            >
              <div className="flex flex-col items-center p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mb-3 animate-pulse-gentle">
                  <Heart className="w-6 h-6 text-emerald-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">Make Impact</h3>
                <p className="text-sm text-gray-600 text-center">Support causes that matter to you</p>
              </div>

              <div className="flex flex-col items-center p-4 bg-blue-50 rounded-xl border border-blue-100">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3 animate-pulse-gentle delay-100">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">Build Community</h3>
                <p className="text-sm text-gray-600 text-center">Connect with like-minded supporters</p>
              </div>

              <div className="flex flex-col items-center p-4 bg-purple-50 rounded-xl border border-purple-100">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-3 animate-pulse-gentle delay-200">
                  <Globe className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">Global Reach</h3>
                <p className="text-sm text-gray-600 text-center">Make a difference worldwide</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div
              className={`flex flex-col sm:flex-row gap-4 justify-center items-center transition-all duration-1000 delay-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
            >
              <Button
                asChild
                size="lg"
                className="bg-emerald-600 hover:bg-emerald-700 text-lg px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group"
              >
                <Link href="/start">
                  Start a Fundraiser
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                size="lg"
                className="text-lg px-8 py-4 rounded-xl border-2 hover:bg-gray-50 transition-all duration-300"
              >
                <Link href="/explore">Explore Projects</Link>
              </Button>
            </div>

            {/* Trust Indicators */}
            <div
              className={`mt-10 pt-8 border-t border-gray-200 transition-all duration-1000 delay-900 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
            >
              <p className="text-sm text-gray-500 mb-4">Trusted by millions worldwide</p>
              <div className="flex flex-wrap justify-center items-center gap-8 text-gray-400">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium">$2.5B+ Raised</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse delay-100"></div>
                  <span className="text-sm font-medium">5M+ Donors</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse delay-200"></div>
                  <span className="text-sm font-medium">100K+ Campaigns</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(-180deg); }
        }
        
        @keyframes wave {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(20deg); }
          75% { transform: rotate(-10deg); }
        }
        
        @keyframes wave-container {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        
        @keyframes sparkle {
          0%, 100% { transform: scale(0.8) rotate(0deg); opacity: 0.8; }
          50% { transform: scale(1.2) rotate(180deg); opacity: 1; }
        }
        
        @keyframes sparkle-delayed {
          0%, 100% { transform: scale(0.9) rotate(0deg); opacity: 0.6; }
          50% { transform: scale(1.1) rotate(-180deg); opacity: 1; }
        }
        
        @keyframes pulse-gentle {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-float-delayed { animation: float-delayed 8s ease-in-out infinite; }
        .animate-wave { animation: wave 2s ease-in-out infinite; }
        .animate-wave-container { animation: wave-container 4s ease-in-out infinite; }
        .animate-sparkle { animation: sparkle 3s ease-in-out infinite; }
        .animate-sparkle-delayed { animation: sparkle-delayed 4s ease-in-out infinite; }
        .animate-pulse-gentle { animation: pulse-gentle 3s ease-in-out infinite; }
      `}</style>
    </div>
  )
}
