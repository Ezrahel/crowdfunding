import type { Metadata } from "next"
import { DonationSuccessPage } from "@/components/donation-success-page"

export const metadata: Metadata = {
  title: "Thank You! - Donation Successful",
  description: "Your donation has been processed successfully",
}

export default async function DonationSuccessPageRoute({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <DonationSuccessPage donationId={id} />
}
