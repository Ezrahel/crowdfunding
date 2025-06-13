import type { Metadata } from "next"
import SignupForm from "@/components/auth/signup-form"
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: "Sign Up - FundRaise",
  description: "Create your account to start fundraising or supporting campaigns",
}

export default function SignupPage() {
  return <SignupForm />
}
