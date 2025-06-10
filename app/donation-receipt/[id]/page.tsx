import type { Metadata } from "next"
import { DonationReceiptPage } from "@/components/donation-receipt-page"

export const metadata: Metadata = {
  title: "Donation Receipt - FundRaise",
  description: "Your donation receipt and confirmation",
}

export default function DonationReceiptPageRoute({ params }: { params: { id: string } }) {
  return <DonationReceiptPage receiptId={params.id} />
}
