import type { Metadata } from "next"
import EmailNotVerified from "@/components/auth/email-not-verified"

export const metadata: Metadata = {
  title: "Email Not Verified - FundRaise",
  description: "Please verify your email address to continue using FundRaise.",
}

export default function EmailNotVerifiedPage() {
  return <EmailNotVerified />
}
