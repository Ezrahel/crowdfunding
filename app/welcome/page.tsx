import type { Metadata } from "next"
import { WelcomeScreen } from "@/components/welcome-screen"

export const metadata: Metadata = {
  title: "Welcome to FundRaise - Start Your Journey",
  description: "Join thousands of people making a difference through crowdfunding",
}

export default function WelcomePage() {
  return <WelcomeScreen />
}
