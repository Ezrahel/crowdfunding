import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { FileText, Share2, Heart, ArrowRight } from "lucide-react"

export function HowItWorks() {
  const steps = [
    {
      icon: FileText,
      title: "Start your fundraiser",
      description: "Create your campaign in just a few minutes. Tell your story, set your goal, and add photos.",
      color: "bg-emerald-100 text-emerald-600",
    },
    {
      icon: Share2,
      title: "Share with friends & family",
      description: "Spread the word on social media, email, and text to reach more potential donors.",
      color: "bg-blue-100 text-blue-600",
    },
    {
      icon: Heart,
      title: "Manage donations",
      description: "Accept donations, thank your supporters, and keep everyone updated on your progress.",
      color: "bg-purple-100 text-purple-600",
    },
  ]

  return (
    <section className="py-24 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">How it works</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Starting a fundraiser is simple and free. Get the support you need in three easy steps.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {steps.map((step, index) => (
            <Card key={index} className="relative border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
              <CardContent className="p-8 text-center">
                <div
                  className={`w-16 h-16 ${step.color} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}
                >
                  <step.icon className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{step.title}</h3>
                <p className="text-gray-600 leading-relaxed">{step.description}</p>

                {/* Step Number */}
                <div className="absolute -top-4 -right-4 w-8 h-8 bg-emerald-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  {index + 1}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Button asChild size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-lg px-8 py-4 rounded-xl">
            <Link href="/start">
              Start Your Fundraiser Now
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </Button>
          <p className="text-sm text-gray-500 mt-4">Free to start • No upfront costs • Keep more of what you raise</p>
        </div>
      </div>
    </section>
  )
}
