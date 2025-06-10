"use client"

import React from "react"

import { useState } from "react"
import { CampaignCard } from "@/components/campaign-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Search } from "lucide-react"

const allCampaigns = [
  {
    id: 1,
    title: "Help Sarah's Medical Treatment",
    description:
      "Supporting Sarah through her cancer treatment journey. Every donation helps cover medical expenses and gives hope.",
    image: "/placeholder.svg?height=300&width=400",
    goal: 50000,
    raised: 32500,
    donors: 245,
    daysLeft: 12,
    organizer: "John Smith",
    location: "New York, NY",
    category: "medical",
  },
  {
    id: 2,
    title: "Rebuild After Hurricane Damage",
    description: "Our community was devastated by the recent hurricane. Help us rebuild homes and restore hope.",
    image: "/placeholder.svg?height=300&width=400",
    goal: 100000,
    raised: 67800,
    donors: 432,
    daysLeft: 25,
    organizer: "Maria Garcia",
    location: "Miami, FL",
    category: "emergency",
  },
  {
    id: 3,
    title: "Education Fund for Underprivileged Kids",
    description: "Providing school supplies, books, and educational resources to children in need.",
    image: "/placeholder.svg?height=300&width=400",
    goal: 25000,
    raised: 18750,
    donors: 156,
    daysLeft: 8,
    organizer: "David Johnson",
    location: "Chicago, IL",
    category: "education",
  },
  {
    id: 4,
    title: "Save the Local Animal Shelter",
    description: "Our beloved animal shelter needs urgent funding to continue caring for abandoned pets.",
    image: "/placeholder.svg?height=300&width=400",
    goal: 75000,
    raised: 45600,
    donors: 298,
    daysLeft: 18,
    organizer: "Animal Friends Society",
    location: "Portland, OR",
    category: "animals",
  },
  {
    id: 5,
    title: "Memorial Fund for Fallen Hero",
    description: "Honoring the memory of Officer Mike Thompson and supporting his family during this difficult time.",
    image: "/placeholder.svg?height=300&width=400",
    goal: 40000,
    raised: 38900,
    donors: 567,
    daysLeft: 5,
    organizer: "Police Benevolent Association",
    location: "Dallas, TX",
    category: "memorial",
  },
  {
    id: 6,
    title: "Youth Sports Program Revival",
    description: "Bringing back our community youth sports program to keep kids active and engaged.",
    image: "/placeholder.svg?height=300&width=400",
    goal: 30000,
    raised: 12400,
    donors: 89,
    daysLeft: 35,
    organizer: "Community Center",
    location: "Phoenix, AZ",
    category: "sports",
  },
  {
    id: 7,
    title: "Clean Water Initiative",
    description: "Building wells and water purification systems for rural communities without access to clean water.",
    image: "/placeholder.svg?height=300&width=400",
    goal: 80000,
    raised: 23400,
    donors: 178,
    daysLeft: 42,
    organizer: "Water for All Foundation",
    location: "Austin, TX",
    category: "community",
  },
  {
    id: 8,
    title: "Veteran Support Program",
    description: "Providing mental health support and job training for veterans transitioning to civilian life.",
    image: "/placeholder.svg?height=300&width=400",
    goal: 60000,
    raised: 41200,
    donors: 234,
    daysLeft: 28,
    organizer: "Veterans United",
    location: "San Diego, CA",
    category: "community",
  },
]

export function ExploreCampaigns() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [sortBy, setSortBy] = useState("newest")
  const [filteredCampaigns, setFilteredCampaigns] = useState(allCampaigns)

  const categories = [
    { value: "all", label: "All Categories" },
    { value: "medical", label: "Medical" },
    { value: "emergency", label: "Emergency" },
    { value: "education", label: "Education" },
    { value: "animals", label: "Animals" },
    { value: "community", label: "Community" },
    { value: "sports", label: "Sports" },
    { value: "memorial", label: "Memorial" },
  ]

  const sortOptions = [
    { value: "newest", label: "Newest" },
    { value: "ending_soon", label: "Ending Soon" },
    { value: "most_funded", label: "Most Funded" },
    { value: "most_donors", label: "Most Donors" },
  ]

  const handleSearch = () => {
    let filtered = allCampaigns

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (campaign) =>
          campaign.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          campaign.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          campaign.location.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter((campaign) => campaign.category === selectedCategory)
    }

    // Sort campaigns
    switch (sortBy) {
      case "ending_soon":
        filtered.sort((a, b) => a.daysLeft - b.daysLeft)
        break
      case "most_funded":
        filtered.sort((a, b) => b.raised / b.goal - a.raised / a.goal)
        break
      case "most_donors":
        filtered.sort((a, b) => b.donors - a.donors)
        break
      default: // newest
        filtered.sort((a, b) => b.id - a.id)
    }

    setFilteredCampaigns(filtered)
  }

  // Apply filters whenever search parameters change
  React.useEffect(() => {
    handleSearch()
  }, [searchQuery, selectedCategory, sortBy])

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Explore Campaigns</h1>
          <p className="text-lg text-gray-600">Discover inspiring stories and support causes that matter to you</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-2xl p-6 mb-8 shadow-sm">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                placeholder="Search campaigns, causes, or locations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 text-lg"
              />
            </div>

            {/* Category Filter */}
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full lg:w-48 h-12">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Sort Filter */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full lg:w-48 h-12">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Active Filters */}
          <div className="flex flex-wrap gap-2 mt-4">
            {selectedCategory !== "all" && (
              <Badge variant="secondary" className="flex items-center gap-1">
                {categories.find((c) => c.value === selectedCategory)?.label}
                <button onClick={() => setSelectedCategory("all")} className="ml-1 hover:text-red-600">
                  ×
                </button>
              </Badge>
            )}
            {searchQuery && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Search: "{searchQuery}"
                <button onClick={() => setSearchQuery("")} className="ml-1 hover:text-red-600">
                  ×
                </button>
              </Badge>
            )}
          </div>
        </div>

        {/* Results Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{filteredCampaigns.length} campaigns found</h2>
            <p className="text-gray-600">
              Sorted by {sortOptions.find((o) => o.value === sortBy)?.label.toLowerCase()}
            </p>
          </div>
        </div>

        {/* Campaign Grid */}
        {filteredCampaigns.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {filteredCampaigns.map((campaign) => (
              <CampaignCard key={campaign.id} campaign={campaign} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No campaigns found</h3>
            <p className="text-gray-600 mb-4">Try adjusting your search criteria or browse all campaigns</p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery("")
                setSelectedCategory("all")
              }}
            >
              Clear Filters
            </Button>
          </div>
        )}

        {/* Load More Button */}
        {filteredCampaigns.length > 0 && (
          <div className="text-center">
            <Button variant="outline" size="lg">
              Load More Campaigns
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
