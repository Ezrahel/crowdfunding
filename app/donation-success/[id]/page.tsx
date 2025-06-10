import type { Metadata } from "next"
import { DonationSuccessPage } from "@/components/donation-success-page"

export const metadata: Metadata = {
  title: "Thank You! - Donation Successful",
  description: "Your donation has been processed successfully",
}

export default function DonationSuccessPageRoute({ params }: { params: { id: string } }) {
  return <DonationSuccessPage donationId={params.id} />
}
