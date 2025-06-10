import { DonationPaymentPage } from "@/components/donation-payment-page"

export default function DonatePage({ params }: { params: { id: string } }) {
  return <DonationPaymentPage campaignId={params.id} />
}
