import { CampaignDetail } from "@/components/campaign-detail"

export default function CampaignPage({ params }: { params: { id: string } }) {
  return <CampaignDetail campaignId={params.id} />
}
