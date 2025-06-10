import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Clock, Users, MapPin } from "lucide-react"

interface Campaign {
  id: number
  title: string
  description: string
  image: string
  goal: number
  raised: number
  donors: number
  daysLeft: number
  organizer: string
  location: string
}

interface CampaignCardProps {
  campaign: Campaign
}

export function CampaignCard({ campaign }: CampaignCardProps) {
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
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 bg-white">
      <Link href={`/campaign/${campaign.id}`}>
        <div className="relative">
          <Image
            src={campaign.image || "/placeholder.svg"}
            alt={campaign.title}
            width={400}
            height={300}
            className="w-full h-48 object-cover"
          />
          <div className="absolute top-4 right-4">
            <Badge variant="secondary" className="bg-white/90 text-gray-700">
              <Clock className="w-3 h-3 mr-1" />
              {campaign.daysLeft} days left
            </Badge>
          </div>
        </div>
      </Link>

      <CardContent className="p-6">
        <Link href={`/campaign/${campaign.id}`}>
          <h3 className="text-xl font-semibold text-gray-900 mb-2 hover:text-emerald-600 transition-colors">
            {campaign.title}
          </h3>
        </Link>
        <p className="text-gray-600 mb-4 line-clamp-2">{campaign.description}</p>

        <div className="space-y-3">
          <div className="flex justify-between items-center text-sm">
            <span className="font-semibold text-gray-900">{formatCurrency(campaign.raised)} raised</span>
            <span className="text-gray-600">of {formatCurrency(campaign.goal)} goal</span>
          </div>

          <Progress value={progressPercentage} className="h-2" />

          <div className="flex justify-between items-center text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              <Users className="w-4 h-4" />
              <span>{campaign.donors} donors</span>
            </div>
            <span className="font-medium text-emerald-600">{Math.round(progressPercentage)}% funded</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="px-6 py-4 bg-gray-50 border-t">
        <div className="flex items-center justify-between w-full text-sm text-gray-600">
          <span>by {campaign.organizer}</span>
          <div className="flex items-center space-x-1">
            <MapPin className="w-3 h-3" />
            <span>{campaign.location}</span>
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}
