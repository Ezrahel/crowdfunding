import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Calendar, ArrowRight, Clock, User } from "lucide-react"

export default function BlogPage() {
  const featuredPosts = [
    {
      id: 1,
      title: "Sarah's Journey: From Diagnosis to Recovery",
      excerpt: "How one woman's medical fundraiser brought together a community and changed her life forever.",
      image: "/placeholder.svg?height=400&width=800",
      category: "Success Story",
      date: "May 15, 2024",
      author: "Jessica Williams",
      authorImage: "/placeholder.svg?height=100&width=100",
      readTime: "5 min read",
    },
    {
      id: 2,
      title: "5 Tips for Creating a Compelling Campaign Story",
      excerpt: "Learn how to craft a narrative that resonates with potential donors and drives engagement.",
      image: "/placeholder.svg?height=400&width=800",
      category: "Fundraising Tips",
      date: "May 10, 2024",
      author: "Michael Chen",
      authorImage: "/placeholder.svg?height=100&width=100",
      readTime: "4 min read",
    },
    {
      id: 3,
      title: "Community Rebuilds After Natural Disaster",
      excerpt: "How a small town used crowdfunding to rebuild essential infrastructure after devastating floods.",
      image: "/placeholder.svg?height=400&width=800",
      category: "Success Story",
      date: "May 5, 2024",
      author: "David Rodriguez",
      authorImage: "/placeholder.svg?height=100&width=100",
      readTime: "6 min read",
    },
  ]

  const recentPosts = [
    {
      id: 4,
      title: "The Psychology of Giving: Why People Donate",
      excerpt:
        "Understanding the motivations behind charitable giving can help you create more effective fundraising campaigns.",
      image: "/placeholder.svg?height=300&width=400",
      category: "Research",
      date: "May 3, 2024",
      author: "Dr. Emily Johnson",
      readTime: "7 min read",
    },
    {
      id: 5,
      title: "From Classroom Dream to Reality: Teacher Funds STEM Lab",
      excerpt:
        "How one dedicated educator raised $25,000 to create a state-of-the-art learning environment for students.",
      image: "/placeholder.svg?height=300&width=400",
      category: "Success Story",
      date: "April 28, 2024",
      author: "Robert Smith",
      readTime: "5 min read",
    },
    {
      id: 6,
      title: "Social Media Strategies That Boost Donation Conversion",
      excerpt: "Learn how to leverage different social platforms to maximize your fundraiser's reach and impact.",
      image: "/placeholder.svg?height=300&width=400",
      category: "Fundraising Tips",
      date: "April 25, 2024",
      author: "Sophia Garcia",
      readTime: "6 min read",
    },
    {
      id: 7,
      title: "Animal Shelter Saves 200+ Pets Through Community Support",
      excerpt: "A local animal rescue organization's successful campaign to expand their facilities and services.",
      image: "/placeholder.svg?height=300&width=400",
      category: "Success Story",
      date: "April 20, 2024",
      author: "James Wilson",
      readTime: "4 min read",
    },
    {
      id: 8,
      title: "The Legal Aspects of Fundraising You Should Know",
      excerpt: "Important considerations and requirements for running compliant fundraising campaigns.",
      image: "/placeholder.svg?height=300&width=400",
      category: "Legal",
      date: "April 18, 2024",
      author: "Amanda Lee, Esq.",
      readTime: "8 min read",
    },
    {
      id: 9,
      title: "How to Thank Your Donors Effectively",
      excerpt: "Creative and meaningful ways to show appreciation to the people who support your cause.",
      image: "/placeholder.svg?height=300&width=400",
      category: "Fundraising Tips",
      date: "April 15, 2024",
      author: "Thomas Brown",
      readTime: "5 min read",
    },
  ]

  const successStories = recentPosts.filter((post) => post.category === "Success Story")
  const fundraisingTips = recentPosts.filter((post) => post.category === "Fundraising Tips")
  const researchAndInsights = recentPosts.filter((post) => post.category === "Research" || post.category === "Legal")

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Success Story":
        return "bg-emerald-600"
      case "Fundraising Tips":
        return "bg-blue-600"
      case "Research":
        return "bg-purple-600"
      case "Legal":
        return "bg-orange-600"
      default:
        return "bg-gray-600"
    }
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-emerald-600 to-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-6xl font-bold mb-6">Stories & Insights</h1>
              <p className="text-xl md:text-2xl mb-8 text-emerald-50">
                Inspiring success stories, fundraising tips, and expert insights to help you make a difference.
              </p>
              <div className="relative max-w-md">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  placeholder="Search articles..."
                  className="pl-12 h-14 text-lg bg-white text-gray-900 border-0 shadow-lg"
                />
              </div>
            </div>
            <div className="hidden lg:block">
              <Image
                src="/placeholder.svg?height=400&width=600"
                alt="Blog illustration"
                width={600}
                height={400}
                className="rounded-xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Posts */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-12">Featured Stories</h2>

          <div className="grid lg:grid-cols-3 gap-8">
            {featuredPosts.map((post) => (
              <Card
                key={post.id}
                className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden"
              >
                <div className="relative h-60">
                  <Image src={post.image || "/placeholder.svg"} alt={post.title} fill className="object-cover" />
                  <div className="absolute top-4 left-4">
                    <Badge className={getCategoryColor(post.category)}>{post.category}</Badge>
                  </div>
                </div>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="flex items-center space-x-2">
                      <Image
                        src={post.authorImage || "/placeholder.svg"}
                        alt={post.author}
                        width={30}
                        height={30}
                        className="rounded-full"
                      />
                      <span className="text-sm text-gray-600">{post.author}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span>{post.date}</span>
                    </div>
                  </div>
                  <Link href={`/blog/${post.id}`}>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3 hover:text-emerald-600 transition-colors">
                      {post.title}
                    </h3>
                  </Link>
                  <p className="text-gray-600 mb-4 line-clamp-3">{post.excerpt}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500 flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {post.readTime}
                    </span>
                    <Button asChild variant="ghost" size="sm" className="text-emerald-600 hover:text-emerald-700">
                      <Link href={`/blog/${post.id}`}>
                        Read More
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Posts with Tabs */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Explore by Category</h2>

          <Tabs defaultValue="all" className="space-y-8">
            <TabsList className="grid w-full grid-cols-4 max-w-2xl mx-auto">
              <TabsTrigger value="all">All Posts</TabsTrigger>
              <TabsTrigger value="success">Success Stories</TabsTrigger>
              <TabsTrigger value="tips">Fundraising Tips</TabsTrigger>
              <TabsTrigger value="insights">Research & Legal</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-8">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {recentPosts.map((post) => (
                  <Card
                    key={post.id}
                    className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
                  >
                    <div className="relative h-48">
                      <Image src={post.image || "/placeholder.svg"} alt={post.title} fill className="object-cover" />
                      <div className="absolute top-4 left-4">
                        <Badge className={getCategoryColor(post.category)}>{post.category}</Badge>
                      </div>
                    </div>
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-4 mb-3">
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <User className="h-4 w-4" />
                          <span>{post.author}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Calendar className="h-4 w-4" />
                          <span>{post.date}</span>
                        </div>
                      </div>
                      <Link href={`/blog/${post.id}`}>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-emerald-600 transition-colors">
                          {post.title}
                        </h3>
                      </Link>
                      <p className="text-gray-600 mb-4 line-clamp-2">{post.excerpt}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500 flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {post.readTime}
                        </span>
                        <Button asChild variant="ghost" size="sm" className="text-emerald-600 hover:text-emerald-700">
                          <Link href={`/blog/${post.id}`}>
                            Read More
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="success" className="space-y-8">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {successStories.map((post) => (
                  <Card
                    key={post.id}
                    className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
                  >
                    <div className="relative h-48">
                      <Image src={post.image || "/placeholder.svg"} alt={post.title} fill className="object-cover" />
                      <div className="absolute top-4 left-4">
                        <Badge className={getCategoryColor(post.category)}>{post.category}</Badge>
                      </div>
                    </div>
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-4 mb-3">
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <User className="h-4 w-4" />
                          <span>{post.author}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Calendar className="h-4 w-4" />
                          <span>{post.date}</span>
                        </div>
                      </div>
                      <Link href={`/blog/${post.id}`}>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-emerald-600 transition-colors">
                          {post.title}
                        </h3>
                      </Link>
                      <p className="text-gray-600 mb-4 line-clamp-2">{post.excerpt}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500 flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {post.readTime}
                        </span>
                        <Button asChild variant="ghost" size="sm" className="text-emerald-600 hover:text-emerald-700">
                          <Link href={`/blog/${post.id}`}>
                            Read More
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="tips" className="space-y-8">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {fundraisingTips.map((post) => (
                  <Card
                    key={post.id}
                    className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
                  >
                    <div className="relative h-48">
                      <Image src={post.image || "/placeholder.svg"} alt={post.title} fill className="object-cover" />
                      <div className="absolute top-4 left-4">
                        <Badge className={getCategoryColor(post.category)}>{post.category}</Badge>
                      </div>
                    </div>
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-4 mb-3">
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <User className="h-4 w-4" />
                          <span>{post.author}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Calendar className="h-4 w-4" />
                          <span>{post.date}</span>
                        </div>
                      </div>
                      <Link href={`/blog/${post.id}`}>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-emerald-600 transition-colors">
                          {post.title}
                        </h3>
                      </Link>
                      <p className="text-gray-600 mb-4 line-clamp-2">{post.excerpt}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500 flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {post.readTime}
                        </span>
                        <Button asChild variant="ghost" size="sm" className="text-emerald-600 hover:text-emerald-700">
                          <Link href={`/blog/${post.id}`}>
                            Read More
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="insights" className="space-y-8">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {researchAndInsights.map((post) => (
                  <Card
                    key={post.id}
                    className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
                  >
                    <div className="relative h-48">
                      <Image src={post.image || "/placeholder.svg"} alt={post.title} fill className="object-cover" />
                      <div className="absolute top-4 left-4">
                        <Badge className={getCategoryColor(post.category)}>{post.category}</Badge>
                      </div>
                    </div>
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-4 mb-3">
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <User className="h-4 w-4" />
                          <span>{post.author}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Calendar className="h-4 w-4" />
                          <span>{post.date}</span>
                        </div>
                      </div>
                      <Link href={`/blog/${post.id}`}>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-emerald-600 transition-colors">
                          {post.title}
                        </h3>
                      </Link>
                      <p className="text-gray-600 mb-4 line-clamp-2">{post.excerpt}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500 flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {post.readTime}
                        </span>
                        <Button asChild variant="ghost" size="sm" className="text-emerald-600 hover:text-emerald-700">
                          <Link href={`/blog/${post.id}`}>
                            Read More
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-20 bg-gradient-to-br from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Stay Updated</h2>
          <p className="text-xl max-w-3xl mx-auto mb-8">
            Get the latest success stories, fundraising tips, and platform updates delivered to your inbox.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <Input placeholder="Enter your email" className="flex-1 h-12 bg-white text-gray-900 border-0" />
            <Button className="bg-white text-blue-600 hover:bg-gray-100 h-12 px-8">Subscribe</Button>
          </div>
        </div>
      </section>
    </div>
  )
}
