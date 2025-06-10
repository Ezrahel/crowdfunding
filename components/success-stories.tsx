import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Heart, Users } from "lucide-react"

export function SuccessStories() {
  const stories = [
    {
      id: 1,
      title: "Sarah's Cancer Treatment Fund",
      description:
        "A single mother's fight against cancer brought together a community of 2,500+ donors who raised over $150,000 for her treatment.",
      image: "https://media.gettyimages.com/id/522273384/photo/difficult-birth-at-nigerian-hospital.jpg?s=612x612&w=0&k=20&c=nO3wXEZXoyvo29SOQIc3Qay77431xCx_DppCR8w6GN8=",
      raised: 152000,
      goal: 100000,
      donors: 2547,
      category: "Medical",
      outcome: "Fully Funded",
      quote: "I never imagined so many people would care. This platform gave me hope when I needed it most.",
      author: "Sarah M.",
    },
    {
      id: 2,
      title: "Rebuild After Hurricane",
      description:
        "When Hurricane Maria destroyed their community center, neighbors came together to raise funds and rebuild stronger than before.",
      image: "https://media.istockphoto.com/id/1431442514/photo/hurricane-ian-destroyed-homes-in-florida-residential-area-natural-disaster-and-its.jpg?s=612x612&w=0&k=20&c=JqYTtVfRQYVP1vtKtFeP35vxGpQCUTTLSN-rDflpKzU=",
      raised: 85000,
      goal: 75000,
      donors: 1234,
      category: "Emergency",
      outcome: "Goal Exceeded",
      quote: "Our community is stronger because of the generosity of strangers who became friends.",
      author: "Maria G.",
    },
    {
      id: 3,
      title: "Scholarship for Underprivileged Students",
      description:
        "A teacher's mission to provide college scholarships for her students turned into a movement that has helped 50+ students pursue higher education.",
      image: "https://media.istockphoto.com/id/527881215/photo/university-girl-holding-education-sack-in-bamako-mali.webp?a=1&b=1&s=612x612&w=0&k=20&c=S43UUN1Ew1Wp-fA6IZw4DKAP2xf7sakZjCyaTXHylqE=",
      raised: 125000,
      goal: 120000,
      donors: 892,
      category: "Education",
      outcome: "Ongoing Success",
      quote: "Every donation represents a student's dream coming true. Education changes everything.",
      author: "Dr. Jennifer L.",
    },
  ]

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <section className="py-24 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Real Stories, Real Impact</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            See how our platform has helped people achieve their goals and overcome challenges with the support of
            generous donors.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          {stories.map((story) => (
            <Card
              key={story.id}
              className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden group"
            >
              <div className="relative">
                <Image
                  src={story.image || "/placeholder.svg"}
                  alt={story.title}
                  width={400}
                  height={300}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-4 left-4">
                  <Badge className="bg-emerald-600 text-white">{story.outcome}</Badge>
                </div>
                <div className="absolute top-4 right-4">
                  <Badge variant="secondary">{story.category}</Badge>
                </div>
              </div>

              <CardContent className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{story.title}</h3>
                <p className="text-gray-600 mb-4 line-clamp-3">{story.description}</p>

                {/* Progress */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-semibold text-emerald-600">{formatCurrency(story.raised)} raised</span>
                    <span className="text-gray-600">of {formatCurrency(story.goal)} goal</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-emerald-600 h-2 rounded-full"
                      style={{ width: `${Math.min((story.raised / story.goal) * 100, 100)}%` }}
                    ></div>
                  </div>
                  <div className="flex items-center justify-between mt-2 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-1" />
                      {story.donors.toLocaleString()} donors
                    </div>
                    <div className="flex items-center">
                      <Heart className="w-4 h-4 mr-1 text-red-500" />
                      {Math.round((story.raised / story.goal) * 100)}% funded
                    </div>
                  </div>
                </div>

                {/* Quote */}
                <blockquote className="border-l-4 border-emerald-600 pl-4 italic text-gray-700 mb-4">
                  "{story.quote}"<footer className="text-sm text-gray-600 mt-1">— {story.author}</footer>
                </blockquote>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Button asChild variant="outline" size="lg" className="border-2 hover:bg-gray-50">
            <Link href="/success-stories">
              Read More Success Stories
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
