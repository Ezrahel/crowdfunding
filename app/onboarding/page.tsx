import type { Metadata } from "next"
import OnboardingForm from "@/components/onboarding/onboarding-form"

export const metadata: Metadata = {
  title: "Complete Onboarding - FundRaise",
  description: "Complete your profile to get a dedicated virtual account",
}

export default function OnboardingPage() {
  return <OnboardingForm />
}

