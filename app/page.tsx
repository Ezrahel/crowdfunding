import { Hero } from "@/components/hero"
import { TrustIndicators } from "@/components/trust-indicators"
import { HowItWorks } from "@/components/how-it-works"
import { FeaturedCampaigns } from "@/components/featured-campaigns"
import { SuccessStories } from "@/components/success-stories"
import { ImpactStats } from "@/components/impact-stats"
import { Categories } from "@/components/categories"
import { Testimonials } from "@/components/testimonials"
import CallToAction from "@/components/call-to-action"
import { Newsletter } from "@/components/newsletter"
import { FAQ } from "@/components/faq"

export default function HomePage() {
  return (
    <div className="space-y-0">
      <Hero />
      <TrustIndicators />
      <HowItWorks />
      <FeaturedCampaigns />
      <ImpactStats />
      <Categories />
      <SuccessStories />
      <Testimonials />
      <CallToAction />
      <Newsletter />
      <FAQ />
    </div>
  )
}
