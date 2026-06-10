import type { Metadata } from "next"
import { CampaignCreatedPage } from "@/components/campaign-created-page"

export const metadata: Metadata = {
  title: "Campaign Created Successfully!",
  description: "Your fundraising campaign is now live",
}

export default async function CampaignCreatedPageRoute({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <CampaignCreatedPage campaignId={id} />
}
