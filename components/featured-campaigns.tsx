import { CampaignCard } from "@/components/campaign-card"

const featuredCampaigns = [
  {
    id: 1,
    title: "Help Sarah's Medical Treatment",
    description:
      "Supporting Sarah through her cancer treatment journey. Every donation helps cover medical expenses and gives hope.",
    image: "https://media.gettyimages.com/id/522273384/photo/difficult-birth-at-nigerian-hospital.jpg?s=612x612&w=0&k=20&c=nO3wXEZXoyvo29SOQIc3Qay77431xCx_DppCR8w6GN8=",
    goal: 50000,
    raised: 32500,
    donors: 245,
    daysLeft: 12,
    organizer: "John Smith",
    location: "New York, NY",
  },
  {
    id: 2,
    title: "Rebuild After Hurricane Damage",
    description: "Our community was devastated by the recent hurricane. Help us rebuild homes and restore hope.",
    image: "https://media.istockphoto.com/id/1431442514/photo/hurricane-ian-destroyed-homes-in-florida-residential-area-natural-disaster-and-its.jpg?s=612x612&w=0&k=20&c=JqYTtVfRQYVP1vtKtFeP35vxGpQCUTTLSN-rDflpKzU=",
    goal: 100000,
    raised: 67800,
    donors: 432,
    daysLeft: 25,
    organizer: "Maria Garcia",
    location: "Miami, FL",
  },
  {
    id: 3,
    title: "Education Fund for Underprivileged Kids",
    description: "Providing school supplies, books, and educational resources to children in need.",
    image: "https://media.gettyimages.com/id/1245752928/photo/ngarannam-nigeria-boys-are-pictured-in-the-small-village-that-was-destroyed-by-boko-haram-and.jpg?s=612x612&w=0&k=20&c=Y5fDL2MLPd_E8ZuzTF0Agel_SOEt6fj1SOR-OkVDmkk=",
    goal: 25000,
    raised: 18750,
    donors: 156,
    daysLeft: 8,
    organizer: "David Johnson",
    location: "Chicago, IL",
  },
  {
    id: 4,
    title: "Save the Local Animal Shelter",
    description: "Our beloved animal shelter needs urgent funding to continue caring for abandoned pets.",
    image: "https://media.istockphoto.com/id/1095673870/photo/priceless-moments.jpg?s=612x612&w=0&k=20&c=T37mCP2iJpOXT15Puv4zEQE75kIeWSu5L5O2B3ckPCg=",
    goal: 75000,
    raised: 45600,
    donors: 298,
    daysLeft: 18,
    organizer: "Animal Friends Society",
    location: "Portland, OR",
  },
  {
    id: 5,
    title: "Memorial Fund for Fallen Hero",
    description: "Honoring the memory of Officer Mike Thompson and supporting his family during this difficult time.",
    image: "https://media.istockphoto.com/id/1456512882/photo/funeral-sad-and-woman-with-flower-on-coffin-after-loss-of-a-loved-one-family-or-friend-grief.jpg?s=612x612&w=0&k=20&c=NpSY2124QMvfxwJqtEZKrlZn5WSkLYiFcXthOfY6o-0=",
    goal: 40000,
    raised: 38900,
    donors: 567,
    daysLeft: 5,
    organizer: "Police Benevolent Association",
    location: "Dallas, TX",
  },
  {
    id: 6,
    title: "Youth Sports Program Revival",
    description: "Bringing back our community youth sports program to keep kids active and engaged.",
    image: "https://images.unsplash.com/photo-1731953083387-41fb462906bf?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NDB8fGFmcmljYW4lMjBzdHJlZXQlMjBmb290YmFsbHxlbnwwfHwwfHx8MA%3D%3D",
    goal: 30000,
    raised: 12400,
    donors: 89,
    daysLeft: 35,
    organizer: "Community Center",
    location: "Phoenix, AZ",
  },
]

export function FeaturedCampaigns() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Campaigns</h2>
          <p className="text-lg text-gray-600">Discover inspiring stories and make a difference today</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredCampaigns.map((campaign) => (
            <CampaignCard key={campaign.id} campaign={campaign} />
          ))}
        </div>
      </div>
    </section>
  )
}
