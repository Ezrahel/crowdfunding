"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Rocket, Eye, Copy, Facebook, Twitter, Mail, ArrowRight, Sparkles, Megaphone } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"

interface CampaignCreatedPageProps {
  campaignId: string
}

export function CampaignCreatedPage({ campaignId }: CampaignCreatedPageProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [rocketLaunched, setRocketLaunched] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    setIsVisible(true)
    setTimeout(() => setRocketLaunched(true), 800)
  }, [])

  // Mock campaign data
  const campaign = {
    id: campaignId,
    title: "Help Build Clean Water Wells in Rural Communities",
    url: `https://fundraise.com/campaign/${campaignId}`,
    goal: 50000,
    category: "Community Development",
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(campaign.url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const shareLinks = {
    facebook: `https://facebook.com/sharer/sharer.php?u=${encodeURIComponent(campaign.url)}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(campaign.url)}&text=${encodeURIComponent(`Check out my new campaign: ${campaign.title}`)}`,
    email: `mailto:?subject=${encodeURIComponent(campaign.title)}&body=${encodeURIComponent(`I just launched a new fundraising campaign. Check it out: ${campaign.url}`)}`,
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Animation Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full animate-float-up opacity-60"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${8 + Math.random() * 4}s`,
            }}
          />
        ))}
      </div>

      <div className="relative w-full max-w-2xl">
        <Card
          className={`border-0 shadow-2xl bg-white/95 backdrop-blur-sm transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-8 scale-95"}`}
        >
          <CardContent className="p-8 lg:p-12 text-center">
            {/* Launch Animation */}
            <div className="mb-8">
              <div className="relative mx-auto w-32 h-32 lg:w-40 lg:h-40">
                {/* Rocket Launch */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center shadow-lg transition-all duration-1000 ${rocketLaunched ? "animate-rocket-launch" : "animate-rocket-idle"}`}
                >
                  <Rocket className="w-16 h-16 lg:w-20 lg:h-20 text-blue-600 animate-rocket-spin" />
                </div>

                {/* Launch Trail */}
                {rocketLaunched && (
                  <div
                    className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 bg-gradient-to-t from-orange-400 to-transparent animate-trail opacity-80"
                    style={{ height: "200px" }}
                  />
                )}

                {/* Megaphone Icon */}
                <div className="absolute -top-2 -left-2 w-10 h-10 bg-purple-200 rounded-full flex items-center justify-center shadow-lg animate-megaphone-bounce">
                  <Megaphone className="w-6 h-6 text-purple-600" />
                </div>

                {/* Sparkle Effects */}
                <div className="absolute -top-1 -right-3 w-6 h-6 bg-yellow-300 rounded-full animate-sparkle-launch opacity-80">
                  <Sparkles className="w-4 h-4 text-yellow-600 m-1" />
                </div>
                <div className="absolute -bottom-2 -right-1 w-5 h-5 bg-pink-300 rounded-full animate-sparkle-launch-delayed opacity-80">
                  <Sparkles className="w-3 h-3 text-pink-600 m-1" />
                </div>
              </div>
            </div>

            {/* Success Message */}
            <div
              className={`transition-all duration-1000 delay-300 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
            >
              <Badge variant="secondary" className="mb-4 px-4 py-2 text-sm font-medium bg-blue-100 text-blue-700">
                Campaign Live
              </Badge>

              <h1 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-4 leading-tight">
                Your Campaign is{" "}
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Live!
                </span>
              </h1>

              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Congratulations! Your fundraising campaign has been successfully created and is now live. Start sharing
                it with your network to begin raising funds.
              </p>
            </div>

            {/* Campaign Summary */}
            <div
              className={`transition-all duration-1000 delay-500 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
            >
              <Card className="bg-blue-50 border-blue-200 mb-8">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-blue-800 mb-4 flex items-center justify-center">
                    <Rocket className="w-5 h-5 mr-2" />
                    Campaign Details
                  </h3>

                  <div className="space-y-3 text-left">
                    <div className="flex justify-between items-start">
                      <span className="text-gray-700">Title:</span>
                      <span className="font-medium text-gray-900 text-right max-w-xs">{campaign.title}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Goal:</span>
                      <span className="font-medium text-gray-900">${campaign.goal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Category:</span>
                      <span className="font-medium text-gray-900">{campaign.category}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Campaign URL:</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCopyLink}
                        className="text-blue-600 hover:text-blue-700 p-1 h-auto"
                      >
                        {copied ? "Copied!" : "Copy Link"}
                        <Copy className="w-3 h-3 ml-1" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Share Section */}
            <div
              className={`transition-all duration-1000 delay-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Share Your Campaign</h3>
              <p className="text-gray-600 mb-6">
                The more people who see your campaign, the more likely you are to reach your goal!
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <Button
                  asChild
                  className="bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group"
                >
                  <a href={shareLinks.facebook} target="_blank" rel="noopener noreferrer">
                    <Facebook className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                    Facebook
                  </a>
                </Button>

                <Button
                  asChild
                  className="bg-sky-500 hover:bg-sky-600 text-white py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group"
                >
                  <a href={shareLinks.twitter} target="_blank" rel="noopener noreferrer">
                    <Twitter className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                    Twitter
                  </a>
                </Button>

                <Button
                  asChild
                  variant="outline"
                  className="py-3 rounded-xl border-2 hover:bg-gray-50 transition-all duration-300 group"
                >
                  <a href={shareLinks.email}>
                    <Mail className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                    Email
                  </a>
                </Button>
              </div>
            </div>

            {/* Action Buttons */}
            <div
              className={`space-y-4 transition-all duration-1000 delay-900 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
            >
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  asChild
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-lg py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group"
                >
                  <Link href={`/campaign/${campaign.id}`}>
                    <Eye className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                    Preview Campaign
                  </Link>
                </Button>

                <Button
                  asChild
                  variant="outline"
                  className="flex-1 text-lg py-3 rounded-xl border-2 hover:bg-gray-50 transition-all duration-300 group"
                >
                  <Link href="/dashboard">
                    Go to Dashboard
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </div>
            </div>

            {/* Tips Section */}
            <div
              className={`mt-8 pt-6 border-t border-gray-200 transition-all duration-1000 delay-1100 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
            >
              <div className="bg-purple-50 rounded-xl p-6">
                <h4 className="font-semibold text-purple-800 mb-3">💡 Tips for Success</h4>
                <ul className="text-sm text-purple-700 space-y-2 text-left">
                  <li>• Share your campaign on social media regularly</li>
                  <li>• Send personal messages to friends and family</li>
                  <li>• Post updates to keep supporters engaged</li>
                  <li>• Thank your donors publicly when appropriate</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        @keyframes float-up {
          0% { transform: translateY(100vh) rotate(0deg); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(-100vh) rotate(360deg); opacity: 0; }
        }
        
        @keyframes rocket-idle {
          0%, 100% { transform: scale(1) rotate(0deg); }
          50% { transform: scale(1.05) rotate(5deg); }
        }
        
        @keyframes rocket-launch {
          0% { transform: scale(1) translateY(0); }
          50% { transform: scale(1.1) translateY(-10px); }
          100% { transform: scale(1) translateY(0); }
        }
        
        @keyframes rocket-spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes trail {
          0% { opacity: 0; height: 0; }
          50% { opacity: 1; height: 200px; }
          100% { opacity: 0; height: 200px; }
        }
        
        @keyframes megaphone-bounce {
          0%, 100% { transform: scale(1) rotate(0deg); }
          50% { transform: scale(1.1) rotate(10deg); }
        }
        
        @keyframes sparkle-launch {
          0%, 100% { transform: scale(0.8) rotate(0deg); opacity: 0.8; }
          50% { transform: scale(1.4) rotate(180deg); opacity: 1; }
        }
        
        @keyframes sparkle-launch-delayed {
          0%, 100% { transform: scale(0.9) rotate(0deg); opacity: 0.6; }
          50% { transform: scale(1.3) rotate(-180deg); opacity: 1; }
        }
        
        .animate-float-up { animation: float-up linear infinite; }
        .animate-rocket-idle { animation: rocket-idle 3s ease-in-out infinite; }
        .animate-rocket-launch { animation: rocket-launch 2s ease-in-out infinite; }
        .animate-rocket-spin { animation: rocket-spin 8s linear infinite; }
        .animate-trail { animation: trail 3s ease-out infinite; }
        .animate-megaphone-bounce { animation: megaphone-bounce 2s ease-in-out infinite; }
        .animate-sparkle-launch { animation: sparkle-launch 2s ease-in-out infinite; }
        .animate-sparkle-launch-delayed { animation: sparkle-launch-delayed 3s ease-in-out infinite; }
      `}</style>
    </div>
  )
}
