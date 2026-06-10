import { DonationPaymentPage } from "@/components/donation-payment-page"

export default async function DonatePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <DonationPaymentPage campaignId={id} />
}
