import type { Metadata } from "next"
import ResetPasswordForm from "@/components/auth/reset-password-form"

export const metadata: Metadata = {
  title: "Reset Password - FundRaise",
  description: "Create a new password for your account",
}

interface ResetPasswordPageProps {
  params: {
    token: string
  }
}

export default function ResetPasswordPage({ params }: ResetPasswordPageProps) {
  return <ResetPasswordForm token={params.token} />
}
