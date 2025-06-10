import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Heart, Users, Globe, Award, ArrowRight } from "lucide-react"

export default function AboutPage() {
  const teamMembers = [
    {
      name: "Sarah Johnson",
      role: "CEO & Co-Founder",
      bio: "Former non-profit director with 15+ years of experience in fundraising and community building.",
      image: "/placeholder.svg?height=300&width=300",
    },
    {
      name: "Michael Chen",
      role: "CTO & Co-Founder",
      bio: "Tech entrepreneur with a passion for creating platforms that drive social impact and positive change.",
      image: "/placeholder.svg?height=300&width=300",
    },
    {
      name: "Priya Patel",
      role: "Chief Impact Officer",
      bio: "Social impact strategist who has helped raise over $50M for various causes worldwide.",
      image: "/placeholder.svg?height=300&width=300",
    },
    {
      name: "David Rodriguez",
      role: "Head of Customer Success",
      bio: "Customer experience expert dedicated to helping campaign creators achieve their fundraising goals.",
      image: "/placeholder.svg?height=300&width=300",
    },
  ]

  const values = [
    {
      icon: Heart,
      title: "Compassion",
      description: "We believe in the power of empathy and kindness to create meaningful change in the world.",
    },
    {
      icon: Users,
      title: "Community",
      description: "We foster connections between people who want to help and those who need support.",
    },
    {
      icon: Globe,
      title: "Accessibility",
      description: "We make fundraising accessible to everyone, regardless of background or location.",
    },
    {
      icon: Award,
      title: "Integrity",
      description: "We uphold the highest standards of transparency, security, and ethical practices.",
    },
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-emerald-600 to-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">Our Mission</h1>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto mb-8 text-emerald-50">
            Empowering people to help each other through the power of community fundraising.
          </p>
          <div className="flex justify-center space-x-4">
            <Button asChild size="lg" className="bg-white text-emerald-600 hover:bg-gray-100">
              <Link href="/start">Start Fundraising</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-white text-white hover:bg-white/10">
              <Link href="/explore">Explore Campaigns</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Our Story</h2>
              <div className="space-y-4 text-lg text-gray-600">
                <p>
                  FundRaise was founded in 2015 with a simple but powerful idea: to create a platform where people could
                  easily help each other in times of need.
                </p>
                <p>
                  What started as a small team working out of a coffee shop has grown into a global community that has
                  raised over $15 billion for causes ranging from medical emergencies to community projects, education
                  funds to disaster relief.
                </p>
                <p>
                  Our platform has enabled millions of people to receive the support they need, while giving donors the
                  opportunity to make a direct and meaningful impact on the lives of others.
                </p>
                <p>
                  Today, we're proud to be the world's leading crowdfunding platform, but our mission remains the same:
                  to empower people to help each other through the power of generosity.
                </p>
              </div>
            </div>
            <div className="relative">
              <Image
                src="/placeholder.svg?height=600&width=800"
                alt="Our team working together"
                width={800}
                height={600}
                className="rounded-2xl shadow-xl"
              />
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-emerald-200 rounded-full opacity-60 -z-10"></div>
              <div className="absolute -top-6 -left-6 w-24 h-24 bg-blue-200 rounded-full opacity-40 -z-10"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Our Values</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              These core principles guide everything we do and every decision we make.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <value.icon className="w-8 h-8 text-emerald-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{value.title}</h3>
                  <p className="text-gray-600">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Our Impact</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Together with our community, we've made a real difference in the lives of millions.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl md:text-5xl font-bold text-emerald-600 mb-2">$15B+</div>
              <p className="text-gray-600">Total raised</p>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-emerald-600 mb-2">50M+</div>
              <p className="text-gray-600">People helped</p>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-emerald-600 mb-2">195</div>
              <p className="text-gray-600">Countries reached</p>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-emerald-600 mb-2">2.1M+</div>
              <p className="text-gray-600">Campaigns funded</p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Meet Our Team</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              The passionate people behind FundRaise who work every day to help you make a difference.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <Card
                key={index}
                className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
              >
                <CardContent className="p-0">
                  <Image
                    src={member.image || "/placeholder.svg"}
                    alt={member.name}
                    width={300}
                    height={300}
                    className="w-full h-64 object-cover"
                  />
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-1">{member.name}</h3>
                    <p className="text-emerald-600 font-medium mb-3">{member.role}</p>
                    <p className="text-gray-600 text-sm">{member.bio}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Join Our Mission</h2>
          <p className="text-xl max-w-3xl mx-auto mb-8">
            Whether you need support or want to make a difference in someone's life, FundRaise is here to help you make
            it happen.
          </p>
          <Button asChild size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
            <Link href="/start">
              Start Your Fundraiser
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
