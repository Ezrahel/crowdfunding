import type { Metadata } from "next"
import LoginForm from "@/components/auth/login-form"

export const metadata: Metadata = {
  title: "Sign In - FundRaise",
  description: "Sign in to your account to manage your campaigns and donations",
}

export default function LoginPage() {
  return <LoginForm />
}
