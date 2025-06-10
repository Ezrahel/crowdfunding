"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { DonationModal } from "@/components/donation-modal"
import { Heart, Flag, MapPin, Facebook, Twitter, Mail, LinkIcon } from "lucide-react"

interface CampaignDetailProps {
  campaignId: string
}

export function CampaignDetail({ campaignId }: CampaignDetailProps) {
  const [isDonationModalOpen, setIsDonationModalOpen] = useState(false)

  // Mock data - in real app, this would be fetched based on campaignId
  const campaign = {
    id: campaignId,
    title: "Help Sarah's Medical Treatment",
    description: "Supporting Sarah through her cancer treatment journey",
    image: "/placeholder.svg?height=400&width=800",
    goal: 50000,
    raised: 32500,
    donors: 245,
    daysLeft: 12,
    organizer: {
      name: "John Smith",
      avatar: "/placeholder.svg?height=100&width=100",
      bio: "Sarah's brother and advocate. Dedicated to helping her through this difficult time.",
      location: "New York, NY",
    },
    story: `Sarah is a 34-year-old mother of two who was recently diagnosed with stage 3 breast cancer. As a single mother working two jobs to support her family, the medical bills are overwhelming.

The treatment plan includes chemotherapy, radiation, and potentially surgery. While insurance covers some costs, there are many expenses that aren't covered including:

• Specialized medications and treatments
• Transportation to and from appointments
• Childcare during treatment days
• Lost wages during recovery periods
• Nutritional supplements and special foods

Sarah has always been the one to help others in our community. She volunteers at the local food bank, helps elderly neighbors with groceries, and never hesitates to lend a helping hand. Now it's our turn to help her.

Every donation, no matter the size, brings us closer to ensuring Sarah can focus on her recovery without the stress of financial burden. Your support means the world to Sarah and her children.

Thank you for your kindness and generosity.`,
    updates: [
      {
        date: "2 days ago",
        title: "Treatment Update",
        content: "Sarah completed her second round of chemotherapy. She's staying strong and positive!",
      },
      {
        date: "1 week ago",
        title: "Thank You!",
        content: "We've reached 65% of our goal! Thank you to everyone who has donated and shared.",
      },
    ],
    donationTiers: [
      { amount: 25, description: "Helps with one meal during treatment" },
      { amount: 50, description: "Covers transportation to one appointment" },
      { amount: 100, description: "Helps with childcare for one treatment day" },
      { amount: 250, description: "Covers specialized medication for one week" },
      { amount: 500, description: "Significant support for treatment costs" },
    ],
  }

  const progressPercentage = (campaign.raised / campaign.goal) * 100

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Image */}
      <div className="relative h-96 w-full">
        <Image src={campaign.image || "/placeholder.svg"} alt={campaign.title} fill className="object-cover" />
        <div className="absolute inset-0 bg-black/20" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Campaign Header */}
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{campaign.title}</h1>
              <p className="text-lg text-gray-600 mb-6">{campaign.description}</p>

              {/* Progress Section */}
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-2xl font-bold text-gray-900">{formatCurrency(campaign.raised)}</span>
                      <span className="text-gray-600">of {formatCurrency(campaign.goal)} goal</span>
                    </div>

                    <Progress value={progressPercentage} className="h-3" />

                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-gray-900">{campaign.donors}</div>
                        <div className="text-sm text-gray-600">donors</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-gray-900">{Math.round(progressPercentage)}%</div>
                        <div className="text-sm text-gray-600">funded</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-gray-900">{campaign.daysLeft}</div>
                        <div className="text-sm text-gray-600">days left</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Story Section */}
            <Card>
              <CardHeader>
                <CardTitle>Campaign Story</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  {campaign.story.split("\n\n").map((paragraph, index) => (
                    <p key={index} className="mb-4 text-gray-700 leading-relaxed">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Updates Section */}
            <Card>
              <CardHeader>
                <CardTitle>Updates</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {campaign.updates.map((update, index) => (
                  <div key={index}>
                    <div className="flex items-center space-x-2 mb-2">
                      <Badge variant="outline">{update.date}</Badge>
                      <h4 className="font-semibold">{update.title}</h4>
                    </div>
                    <p className="text-gray-600">{update.content}</p>
                    {index < campaign.updates.length - 1 && <Separator className="mt-4" />}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Donate Button */}
            <Button
              size="lg"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-lg py-6"
              onClick={() => setIsDonationModalOpen(true)}
            >
              <Heart className="w-5 h-5 mr-2" />
              Donate Now
            </Button>

            {/* Share Buttons */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Share this campaign</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" size="sm">
                    <Facebook className="w-4 h-4 mr-2" />
                    Facebook
                  </Button>
                  <Button variant="outline" size="sm">
                    <Twitter className="w-4 h-4 mr-2" />
                    Twitter
                  </Button>
                  <Button variant="outline" size="sm">
                    <Mail className="w-4 h-4 mr-2" />
                    Email
                  </Button>
                  <Button variant="outline" size="sm">
                    <LinkIcon className="w-4 h-4 mr-2" />
                    Copy Link
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Organizer Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Organizer</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start space-x-4">
                  <Avatar className="w-16 h-16">
                    <AvatarImage src={campaign.organizer.avatar || "/placeholder.svg"} />
                    <AvatarFallback>JS</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{campaign.organizer.name}</h4>
                    <div className="flex items-center text-sm text-gray-600 mt-1">
                      <MapPin className="w-3 h-3 mr-1" />
                      {campaign.organizer.location}
                    </div>
                    <p className="text-sm text-gray-600 mt-2">{campaign.organizer.bio}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Donation Tiers */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Donation Tiers</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {campaign.donationTiers.map((tier, index) => (
                  <div key={index} className="border rounded-lg p-3 hover:bg-gray-50 cursor-pointer">
                    <div className="font-semibold text-emerald-600">{formatCurrency(tier.amount)}</div>
                    <div className="text-sm text-gray-600">{tier.description}</div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Report Button */}
            <Button variant="outline" size="sm" className="w-full">
              <Flag className="w-4 h-4 mr-2" />
              Report Campaign
            </Button>
          </div>
        </div>
      </div>

      <DonationModal isOpen={isDonationModalOpen} onClose={() => setIsDonationModalOpen(false)} campaign={campaign} />
    </div>
  )
}
