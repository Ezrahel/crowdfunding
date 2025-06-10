import type { Metadata } from "next"
import { PayoutSettingsDashboard } from "@/components/payout-settings-dashboard"

export const metadata: Metadata = {
  title: "Payout Settings - FundRaise",
  description: "Manage your payout methods and withdrawal settings",
}

export default function PayoutSettingsPage() {
  return <PayoutSettingsDashboard />
}
