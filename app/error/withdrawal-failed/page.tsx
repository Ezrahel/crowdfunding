import type { Metadata } from "next"
import { WithdrawalFailurePage } from "@/components/withdrawal-failure-page"

export const metadata: Metadata = {
  title: "Withdrawal Failed - FundRaise",
  description: "We're having trouble processing your payout",
}

export default function WithdrawalFailedPage() {
  return <WithdrawalFailurePage />
}
