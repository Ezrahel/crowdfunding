import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Heart, GraduationCap, Zap, Users, PawPrint, Trophy, Briefcase, Palette, ArrowRight } from "lucide-react"

export function Categories() {
  const categories = [
    {
      icon: Heart,
      name: "Medical",
      description: "Help with medical bills and health emergencies",
      count: "125K+ campaigns",
      color: "bg-red-100 text-red-600",
      hoverColor: "hover:bg-red-50",
    },
    {
      icon: Zap,
      name: "Emergency",
      description: "Support for urgent crisis situations",
      count: "89K+ campaigns",
      color: "bg-orange-100 text-orange-600",
      hoverColor: "hover:bg-orange-50",
    },
    {
      icon: GraduationCap,
      name: "Education",
      description: "Fund education and learning opportunities",
      count: "67K+ campaigns",
      color: "bg-blue-100 text-blue-600",
      hoverColor: "hover:bg-blue-50",
    },
    {
      icon: Users,
      name: "Community",
      description: "Build stronger communities together",
      count: "54K+ campaigns",
      color: "bg-green-100 text-green-600",
      hoverColor: "hover:bg-green-50",
    },
    {
      icon: PawPrint,
      name: "Animals",
      description: "Care for pets and wildlife",
      count: "43K+ campaigns",
      color: "bg-purple-100 text-purple-600",
      hoverColor: "hover:bg-purple-50",
    },
    {
      icon: Trophy,
      name: "Sports",
      description: "Support athletes and sports programs",
      count: "32K+ campaigns",
      color: "bg-yellow-100 text-yellow-600",
      hoverColor: "hover:bg-yellow-50",
    },
    {
      icon: Briefcase,
      name: "Business",
      description: "Launch startups and business ventures",
      count: "28K+ campaigns",
      color: "bg-indigo-100 text-indigo-600",
      hoverColor: "hover:bg-indigo-50",
    },
    {
      icon: Palette,
      name: "Creative",
      description: "Fund artistic and creative projects",
      count: "21K+ campaigns",
      color: "bg-pink-100 text-pink-600",
      hoverColor: "hover:bg-pink-50",
    },
  ]

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Explore by Category</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Find campaigns that matter to you or get inspired to start your own fundraiser.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {categories.map((category, index) => (
            <Card
              key={index}
              className={`border-0 shadow-lg ${category.hoverColor} hover:shadow-xl transition-all duration-300 cursor-pointer group`}
            >
              <CardContent className="p-6">
                <div
                  className={`w-12 h-12 ${category.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
                >
                  <category.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{category.name}</h3>
                <p className="text-gray-600 text-sm mb-3">{category.description}</p>
                <p className="text-xs text-gray-500 font-medium">{category.count}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Button asChild variant="outline" size="lg" className="border-2 hover:bg-gray-50">
            <Link href="/explore">
              Browse All Categories
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
