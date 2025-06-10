import type { Metadata } from "next"
import { CampaignCreatedPage } from "@/components/campaign-created-page"

export const metadata: Metadata = {
  title: "Campaign Created Successfully!",
  description: "Your fundraising campaign is now live",
}

export default function CampaignCreatedPageRoute({ params }: { params: { id: string } }) {
  return <CampaignCreatedPage campaignId={params.id} />
}
