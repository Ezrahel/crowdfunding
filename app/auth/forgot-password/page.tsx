import type { Metadata } from "next"
import ForgotPasswordForm from "@/components/auth/forgot-password-form"

export const metadata: Metadata = {
  title: "Forgot Password - FundRaise",
  description: "Reset your password to regain access to your account",
}

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />
}
