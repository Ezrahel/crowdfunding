import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Search,
  FileText,
  BookOpen,
  Video,
  MessageCircle,
  Phone,
  Mail,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Info,
} from "lucide-react"

export default function HelpPage() {
  const helpCategories = [
    {
      title: "Getting Started",
      icon: FileText,
      description: "Learn the basics of creating and managing your fundraiser",
      articles: [
        "How to create your first campaign",
        "Setting realistic fundraising goals",
        "Adding compelling photos and videos",
        "Writing an effective campaign story",
      ],
    },
    {
      title: "Managing Donations",
      icon: CheckCircle,
      description: "Everything you need to know about receiving and managing funds",
      articles: [
        "Setting up your withdrawal method",
        "Understanding platform fees",
        "Tax implications of donations",
        "Sending thank you messages to donors",
      ],
    },
    {
      title: "Promoting Your Campaign",
      icon: ArrowRight,
      description: "Tips and strategies to reach more potential donors",
      articles: [
        "Sharing your campaign on social media",
        "Email outreach strategies",
        "Creating campaign updates",
        "Working with local media",
      ],
    },
    {
      title: "Account & Security",
      icon: Info,
      description: "Manage your account settings and keep your information secure",
      articles: [
        "Changing your password",
        "Two-factor authentication",
        "Privacy settings",
        "Managing notification preferences",
      ],
    },
    {
      title: "Troubleshooting",
      icon: AlertCircle,
      description: "Solutions to common issues and technical problems",
      articles: [
        "Payment processing issues",
        "Campaign not displaying correctly",
        "Updating campaign information",
        "Recovering a lost account",
      ],
    },
  ]

  const popularArticles = [
    "How to withdraw funds from your campaign",
    "Setting up a team fundraiser",
    "Sharing your campaign on social media",
    "Tax deductions for donations",
    "Updating your fundraising goal",
    "Adding beneficiaries to your campaign",
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-emerald-600 to-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">Help Center</h1>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto mb-8">
            Find answers, resources, and support for all your fundraising needs.
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              placeholder="Search for help articles..."
              className="pl-12 h-14 text-lg bg-white text-gray-900 border-0 shadow-lg"
            />
          </div>
        </div>
      </section>

      {/* Help Categories */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Browse Help Topics</h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {helpCategories.map((category, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader>
                  <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
                    <category.icon className="h-6 w-6 text-emerald-600" />
                  </div>
                  <CardTitle className="text-xl">{category.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-6">{category.description}</p>
                  <ul className="space-y-2">
                    {category.articles.map((article, i) => (
                      <li key={i}>
                        <Link
                          href="#"
                          className="text-emerald-600 hover:text-emerald-700 hover:underline flex items-center"
                        >
                          <ArrowRight className="h-4 w-4 mr-2" />
                          {article}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Resources */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Popular Resources</h2>

          <Tabs defaultValue="articles" className="max-w-4xl mx-auto">
            <TabsList className="grid w-full grid-cols-4 mb-8">
              <TabsTrigger value="articles">Articles</TabsTrigger>
              <TabsTrigger value="videos">Video Tutorials</TabsTrigger>
              <TabsTrigger value="guides">Guides</TabsTrigger>
              <TabsTrigger value="webinars">Webinars</TabsTrigger>
            </TabsList>

            <TabsContent value="articles" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                {popularArticles.map((article, index) => (
                  <Card key={index} className="border-0 shadow-md hover:shadow-lg transition-all duration-300">
                    <CardContent className="p-6">
                      <Link href="#" className="flex items-start space-x-4 hover:text-emerald-600">
                        <FileText className="h-5 w-5 text-emerald-600 mt-1 flex-shrink-0" />
                        <span className="font-medium">{article}</span>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <div className="text-center">
                <Button variant="outline" className="border-2">
                  View All Articles
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="videos" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map((_, index) => (
                  <Card
                    key={index}
                    className="border-0 shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden"
                  >
                    <div className="relative h-48 bg-gray-200">
                      <Image
                        src="/placeholder.svg?height=200&width=400"
                        alt="Video thumbnail"
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-16 h-16 bg-emerald-600/90 rounded-full flex items-center justify-center">
                          <Video className="h-8 w-8 text-white" />
                        </div>
                      </div>
                    </div>
                    <CardContent className="p-6">
                      <h3 className="font-medium mb-2">How to Create a Successful Fundraiser</h3>
                      <p className="text-sm text-gray-600">Learn the key elements of a successful campaign (5:23)</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <div className="text-center">
                <Button variant="outline" className="border-2">
                  View All Videos
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="guides" className="space-y-6">
              <div className="grid md:grid-cols-3 gap-6">
                {[1, 2, 3].map((_, index) => (
                  <Card key={index} className="border-0 shadow-md hover:shadow-lg transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                        <BookOpen className="h-6 w-6 text-blue-600" />
                      </div>
                      <h3 className="font-medium mb-2">Complete Guide to Fundraising</h3>
                      <p className="text-sm text-gray-600 mb-4">A comprehensive resource for campaign creators</p>
                      <Button variant="outline" size="sm" className="w-full">
                        Download PDF
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <div className="text-center">
                <Button variant="outline" className="border-2">
                  View All Guides
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="webinars" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                {[1, 2].map((_, index) => (
                  <Card key={index} className="border-0 shadow-md hover:shadow-lg transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                          <Video className="h-6 w-6 text-purple-600" />
                        </div>
                        <Button variant="outline" size="sm">
                          Register
                        </Button>
                      </div>
                      <h3 className="font-medium mb-2">Fundraising Strategies for Non-Profits</h3>
                      <p className="text-sm text-gray-600 mb-2">
                        Learn effective strategies for organization fundraising
                      </p>
                      <p className="text-xs text-gray-500">Next session: June 15, 2024 • 2:00 PM EST</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <div className="text-center">
                <Button variant="outline" className="border-2">
                  View All Webinars
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Contact Support */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Need More Help?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our support team is available to assist you with any questions or concerns.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 text-center">
              <CardContent className="p-6">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <MessageCircle className="h-8 w-8 text-emerald-600" />
                </div>
                <h3 className="text-xl font-semibold mb-4">Live Chat</h3>
                <p className="text-gray-600 mb-6">Chat with our support team in real-time</p>
                <Button className="w-full bg-emerald-600 hover:bg-emerald-700">Start Chat</Button>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 text-center">
              <CardContent className="p-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Phone className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-4">Phone Support</h3>
                <p className="text-gray-600 mb-6">Speak directly with a support agent</p>
                <Button variant="outline" className="w-full">
                  +1 (800) 555-1234
                </Button>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 text-center">
              <CardContent className="p-6">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Mail className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold mb-4">Email Support</h3>
                <p className="text-gray-600 mb-6">Send us a message and we'll respond ASAP</p>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/contact">Contact Form</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Community Support */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Community Support</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Connect with other fundraisers and share tips, advice, and experiences.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4">Community Forum</h3>
                <p className="text-gray-600 mb-6">
                  Join discussions, ask questions, and share your fundraising journey with others.
                </p>
                <Button variant="outline" className="w-full">
                  Visit Forum
                </Button>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4">Success Stories</h3>
                <p className="text-gray-600 mb-6">
                  Read inspiring stories from fundraisers who have successfully reached their goals.
                </p>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/blog">Read Stories</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
}
