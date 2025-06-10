import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight, Sparkles, Shield, Clock } from "lucide-react"

export default function CallToAction() {
  return (
    <section className="py-24 bg-gradient-to-br from-emerald-600 via-emerald-700 to-blue-700 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-full">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="dots" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
                <circle cx="30" cy="30" r="2" fill="white" fillOpacity="0.1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dots)" />
          </svg>
        </div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center px-4 py-2 bg-white/20 text-white rounded-full text-sm font-medium mb-8">
            <Sparkles className="w-4 h-4 mr-2" />
            Join 50M+ people who trust our platform
          </div>

          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">Ready to make a difference?</h2>

          <p className="text-xl md:text-2xl text-emerald-100 mb-12 leading-relaxed">
            Start your fundraiser today and turn your goals into reality with the support of our global community.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
            <Button
              asChild
              size="lg"
              className="bg-white text-emerald-600 hover:bg-gray-100 text-lg px-8 py-4 rounded-xl shadow-lg"
            >
              <Link href="/start">
                Start Your Fundraiser
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="bg-white text-emerald-600 hover:bg-gray-100 text-lg px-8 py-4 rounded-xl shadow-lg"
            >
              <Link href="/explore">Explore Campaigns</Link>
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="grid md:grid-cols-3 gap-8 max-w-3xl mx-auto">
            <div className="flex items-center justify-center space-x-3 text-emerald-100">
              <Shield className="w-6 h-6" />
              <span className="font-medium">100% Secure</span>
            </div>
            <div className="flex items-center justify-center space-x-3 text-emerald-100">
              <Clock className="w-6 h-6" />
              <span className="font-medium">Quick Setup</span>
            </div>
            <div className="flex items-center justify-center space-x-3 text-emerald-100">
              <Sparkles className="w-6 h-6" />
              <span className="font-medium">No Hidden Fees</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
