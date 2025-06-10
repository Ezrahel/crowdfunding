import type { Metadata } from "next"
import TwoFactorForm from "@/components/auth/two-factor-form"

export const metadata: Metadata = {
  title: "Two-Factor Authentication - FundRaise",
  description: "Enter your two-factor authentication code to complete sign in",
}

export default function TwoFactorPage() {
  return <TwoFactorForm />
}
