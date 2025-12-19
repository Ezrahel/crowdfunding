import type { Metadata } from "next"
import EmailVerification from "@/components/auth/email-verification"

export const metadata: Metadata = {
  title: "Verify Email - FundRaise",
  description: "Verify your email address to complete your account setup",
}

export default function EmailVerificationPage() {
  return <EmailVerification />
}

