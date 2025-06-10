import type { Metadata } from "next"
import { PaymentFailurePage } from "@/components/payment-failure-page"

export const metadata: Metadata = {
  title: "Payment Failed - FundRaise",
  description: "Your donation could not be processed",
}

export default function PaymentFailedPage() {
  return <PaymentFailurePage />
}
