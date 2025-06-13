import type { Metadata } from "next"
import EmailVerification from "@/components/auth/email-verification"

export const metadata: Metadata = {
  title: "Email Not Verified - FundRaise",
  description: "Please verify your email address to continue using FundRaise.",
}

export default function EmailVerificationPage() {
  return <EmailVerification />
}
