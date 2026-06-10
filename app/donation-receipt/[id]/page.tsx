import type { Metadata } from "next"
import { DonationReceiptPage } from "@/components/donation-receipt-page"

export const metadata: Metadata = {
  title: "Donation Receipt - FundRaise",
  description: "Your donation receipt and confirmation",
}

export default async function DonationReceiptPageRoute({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <DonationReceiptPage receiptId={id} />
}
