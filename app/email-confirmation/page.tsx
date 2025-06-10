import type { Metadata } from "next"
import { EmailConfirmationScreen } from "@/components/email-confirmation-screen"

export const metadata: Metadata = {
  title: "Confirm Your Email - FundRaise",
  description: "Please check your inbox to confirm your email address",
}

export default function EmailConfirmationPage() {
  return <EmailConfirmationScreen />
}
