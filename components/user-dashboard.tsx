"use client"

import { useState, useEffect } from "react"
import { useAuth, useUser } from "@clerk/nextjs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import {
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts"
import {
  DollarSign,
  TrendingUp,
  Users,
  Heart,
  Edit,
  Eye,
  Calendar,
  MapPin,
  Settings,
  Plus,
  Share2,
  Download,
  Filter,
  Search,
  MoreHorizontal,
  Target,
  Clock,
  Activity,
  Bell,
  CreditCard,
  FileText,
  Globe,
  Phone,
  Camera,
  BarChart3,
  PieChartIcon,
  CheckCircle,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react"

export function UserDashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const [timeRange, setTimeRange] = useState("30d")
  const { getToken, isLoaded, isSignedIn } = useAuth()
  const { user } = useUser()
  const [userStats, setUserStats] = useState({
    totalCampaigns: 0,
    activeCampaigns: 0,
    completedCampaigns: 0,
    totalRaised: 0,
    totalGoal: 0,
    totalDonations: 0,
    totalDonors: 0,
    avgDonation: 0,
    conversionRate: 0,
    monthlyGrowth: 0,
    totalViews: 0,
    socialShares: 0,
  })

  useEffect(() => {
    const fetchUserData = async () => {
      if (!isLoaded || !isSignedIn) return;

      try {
        const token = await getToken();
        if (!token) return;

        // Fetch user-specific data from your backend
        const response = await fetch('http://localhost:8000/api/v1/user/stats', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setUserStats(data);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, [getToken, isLoaded, isSignedIn]);

  if (!isLoaded || !isSignedIn) {
    return <div>Loading...</div>;
  }

  // Enhanced mock data with more realistic metrics
  const stats = {
    totalCampaigns: 5,
    activeCampaigns: 3,
    completedCampaigns: 2,
    totalRaised: 127850,
    totalGoal: 200000,
    totalDonations: 28,
    totalDonors: 342,
    avgDonation: 374,
    conversionRate: 12.5,
    monthlyGrowth: 23.4,
    totalViews: 15420,
    socialShares: 89,
  }

  // Chart data for analytics
  const donationTrends = [
    { date: "Jan", donations: 2400, goal: 3000 },
    { date: "Feb", donations: 1398, goal: 3000 },
    { date: "Mar", donations: 9800, goal: 10000 },
    { date: "Apr", donations: 3908, goal: 5000 },
    { date: "May", donations: 4800, goal: 6000 },
    { date: "Jun", donations: 3800, goal: 4000 },
    { date: "Jul", donations: 4300, goal: 5000 },
  ]

  const campaignPerformance = [
    { name: "Medical Fund", raised: 32500, goal: 50000, donors: 245 },
    { name: "Education", raised: 18750, goal: 25000, donors: 156 },
    { name: "Community", raised: 45600, goal: 75000, donors: 298 },
    { name: "Emergency", raised: 23400, goal: 30000, donors: 178 },
    { name: "Sports", raised: 7600, goal: 20000, donors: 89 },
  ]

  const donorDemographics = [
    { name: "18-25", value: 15, color: "#10b981" },
    { name: "26-35", value: 35, color: "#3b82f6" },
    { name: "36-45", value: 28, color: "#8b5cf6" },
    { name: "46-55", value: 15, color: "#f59e0b" },
    { name: "55+", value: 7, color: "#ef4444" },
  ]

  const recentActivity = [
    {
      type: "donation_received",
      message: "$250 received from John Doe",
      time: "2 hours ago",
      campaign: "Help Sarah's Medical Treatment",
      amount: 250,
      icon: DollarSign,
      color: "text-green-600",
    },
    {
      type: "campaign_shared",
      message: "Campaign shared on Facebook",
      time: "5 hours ago",
      campaign: "Youth Sports Equipment",
      icon: Share2,
      color: "text-blue-600",
    },
    {
      type: "goal_milestone",
      message: "Reached 65% of funding goal",
      time: "1 day ago",
      campaign: "Help Sarah's Medical Treatment",
      icon: Target,
      color: "text-purple-600",
    },
    {
      type: "donation_received",
      message: "$100 received from Anonymous",
      time: "2 days ago",
      campaign: "Community Garden Project",
      amount: 100,
      icon: DollarSign,
      color: "text-green-600",
    },
    {
      type: "campaign_update",
      message: "Posted new update with photos",
      time: "3 days ago",
      campaign: "Animal Shelter Fund",
      icon: FileText,
      color: "text-orange-600",
    },
  ]

  const campaigns = [
    {
      id: 1,
      title: "Help Sarah's Medical Treatment",
      goal: 50000,
      raised: 32500,
      donors: 245,
      status: "active",
      daysLeft: 12,
      image: "/placeholder.svg?height=100&width=100",
      views: 5420,
      shares: 23,
      conversionRate: 15.2,
      avgDonation: 132,
      category: "Medical",
      created: "2024-01-15",
    },
    {
      id: 2,
      title: "Community Garden Project",
      goal: 15000,
      raised: 13250,
      donors: 89,
      status: "completed",
      daysLeft: 0,
      image: "/placeholder.svg?height=100&width=100",
      views: 2340,
      shares: 15,
      conversionRate: 18.7,
      avgDonation: 149,
      category: "Community",
      created: "2023-12-01",
    },
    {
      id: 3,
      title: "Youth Sports Equipment",
      goal: 8000,
      raised: 2400,
      donors: 34,
      status: "active",
      daysLeft: 25,
      image: "/placeholder.svg?height=100&width=100",
      views: 1890,
      shares: 8,
      conversionRate: 8.3,
      avgDonation: 71,
      category: "Sports",
      created: "2024-01-20",
    },
    {
      id: 4,
      title: "Emergency Relief Fund",
      goal: 75000,
      raised: 67800,
      donors: 432,
      status: "active",
      daysLeft: 18,
      image: "/placeholder.svg?height=100&width=100",
      views: 8920,
      shares: 45,
      conversionRate: 22.1,
      avgDonation: 157,
      category: "Emergency",
      created: "2024-01-10",
    },
    {
      id: 5,
      title: "Animal Shelter Support",
      goal: 25000,
      raised: 21900,
      donors: 156,
      status: "completed",
      daysLeft: 0,
      image: "/placeholder.svg?height=100&width=100",
      views: 3450,
      shares: 19,
      conversionRate: 19.4,
      avgDonation: 140,
      category: "Animals",
      created: "2023-11-15",
    },
  ]

  const donations = [
    {
      id: 1,
      campaignTitle: "Hurricane Relief Fund",
      campaignId: 101,
      amount: 100,
      date: "2024-01-15",
      status: "completed",
      method: "Credit Card",
      fee: 3.2,
      net: 96.8,
    },
    {
      id: 2,
      campaignTitle: "Local Animal Shelter",
      campaignId: 102,
      amount: 50,
      date: "2024-01-10",
      status: "completed",
      method: "PayPal",
      fee: 1.75,
      net: 48.25,
    },
    {
      id: 3,
      campaignTitle: "Education for All",
      campaignId: 103,
      amount: 75,
      date: "2024-01-05",
      status: "completed",
      method: "Credit Card",
      fee: 2.48,
      net: 72.52,
    },
    {
      id: 4,
      campaignTitle: "Medical Emergency Fund",
      campaignId: 104,
      amount: 200,
      date: "2024-01-01",
      status: "processing",
      method: "Bank Transfer",
      fee: 0,
      net: 200,
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

  const formatPercent = (value: number) => {
    return `${value.toFixed(1)}%`
  }

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-8">
        {/* Enhanced Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600 mt-1">
                Welcome back {user?.username || user?.firstName || 'User'}! Here's what's happening with your campaigns.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 3 months</SelectItem>
                  <SelectItem value="1y">Last year</SelectItem>
                </SelectContent>
              </Select>
              <Button className="bg-emerald-600 hover:bg-emerald-700">
                <Plus className="w-4 h-4 mr-2" />
                New Campaign
              </Button>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:grid-cols-5 mb-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="donations">Donations</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          {/* Enhanced Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              <Card className="relative overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Raised</CardTitle>
                  <DollarSign className="h-4 w-4 text-emerald-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(userStats.totalRaised)}</div>
                  <div className="flex items-center text-xs text-emerald-600 mt-1">
                    <ArrowUpRight className="h-3 w-3 mr-1" />+{formatPercent(userStats.monthlyGrowth)} from last month
                  </div>
                  <div className="mt-2">
                    <Progress value={(userStats.totalRaised / userStats.totalGoal) * 100} className="h-1" />
                    <p className="text-xs text-gray-500 mt-1">
                      {formatPercent((userStats.totalRaised / userStats.totalGoal) * 100 || 0)} of total goal
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{userStats.activeCampaigns}</div>
                  <p className="text-xs text-gray-600 mt-1">{userStats.totalCampaigns} total campaigns</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="secondary" className="text-xs">
                      {userStats.completedCampaigns} completed
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Donors</CardTitle>
                  <Users className="h-4 w-4 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{userStats.totalDonors}</div>
                  <p className="text-xs text-gray-600 mt-1">Avg. {formatCurrency(userStats.avgDonation)} per donation</p>
                  <div className="flex items-center text-xs text-purple-600 mt-1">
                    <Heart className="h-3 w-3 mr-1" />
                    {formatPercent(userStats.conversionRate)} conversion rate
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Campaign Views</CardTitle>
                  <Eye className="h-4 w-4 text-orange-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{userStats.totalViews.toLocaleString()}</div>
                  <p className="text-xs text-gray-600 mt-1">{userStats.socialShares} social shares</p>
                  <div className="flex items-center text-xs text-orange-600 mt-1">
                    <Share2 className="h-3 w-3 mr-1" />
                    {((userStats.socialShares / userStats.totalViews) * 100).toFixed(1) || 0}% share rate
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
              {/* Donation Trends */}
              <Card className="w-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base lg:text-lg">
                    <BarChart3 className="h-4 w-4 lg:h-5 lg:w-5" />
                    Donation Trends
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 lg:p-6">
                  <div className="w-full h-[250px] lg:h-[300px]">
                    <ChartContainer
                      config={{
                        donations: {
                          label: "Donations",
                          color: "hsl(var(--chart-1))",
                        },
                        goal: {
                          label: "Monthly Goal",
                          color: "hsl(var(--chart-2))",
                        },
                      }}
                      className="w-full h-full"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={donationTrends} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" fontSize={12} tickMargin={5} />
                          <YAxis fontSize={12} tickMargin={5} width={40} />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Area
                            type="monotone"
                            dataKey="donations"
                            stroke="var(--color-donations)"
                            fill="var(--color-donations)"
                            fillOpacity={0.3}
                          />
                          <Line type="monotone" dataKey="goal" stroke="var(--color-goal)" strokeDasharray="5 5" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Campaign Performance */}
              <Card className="w-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base lg:text-lg">
                    <Target className="h-4 w-4 lg:h-5 lg:w-5" />
                    Campaign Performance
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 lg:p-6">
                  <div className="w-full h-[250px] lg:h-[300px]">
                    <ChartContainer
                      config={{
                        raised: {
                          label: "Amount Raised",
                          color: "hsl(var(--chart-1))",
                        },
                      }}
                      className="w-full h-full"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={campaignPerformance}
                          layout="horizontal"
                          margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" fontSize={12} tickMargin={5} />
                          <YAxis dataKey="name" type="category" width={60} fontSize={10} tickMargin={5} />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Bar dataKey="raised" fill="var(--color-raised)" radius={[0, 4, 4, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity & Quick Actions */}
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Recent Activity */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivity.map((activity, index) => (
                      <div
                        key={index}
                        className="flex items-start space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className={`p-2 rounded-full bg-gray-100 ${activity.color}`}>
                          <activity.icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                          <p className="text-xs text-gray-600 truncate">{activity.campaign}</p>
                          <p className="text-xs text-gray-500">{activity.time}</p>
                        </div>
                        {activity.amount && (
                          <div className="text-sm font-semibold text-emerald-600">
                            +{formatCurrency(activity.amount)}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full justify-start" variant="outline">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Campaign
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Share2 className="w-4 h-4 mr-2" />
                    Share Campaign
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <FileText className="w-4 h-4 mr-2" />
                    Post Update
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Export Data
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Bell className="w-4 h-4 mr-2" />
                    Notifications
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Enhanced Campaigns Tab */}
          <TabsContent value="campaigns" className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-2xl font-bold">Campaign Management</h2>
                <p className="text-gray-600">Monitor and manage all your fundraising campaigns</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input placeholder="Search campaigns..." className="pl-10 w-64" />
                </div>
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
                <Button className="bg-emerald-600 hover:bg-emerald-700">
                  <Plus className="w-4 h-4 mr-2" />
                  New Campaign
                </Button>
              </div>
            </div>

            <div className="grid gap-6">
              {campaigns.map((campaign) => (
                <Card key={campaign.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <img
                        src={campaign.image || "/placeholder.svg"}
                        alt={campaign.title}
                        className="w-24 h-24 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-xl font-semibold mb-2">{campaign.title}</h3>
                            <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                              <Badge variant={campaign.status === "active" ? "default" : "secondary"}>
                                {campaign.status}
                              </Badge>
                              <span className="flex items-center">
                                <Calendar className="w-4 h-4 mr-1" />
                                Created {new Date(campaign.created).toLocaleDateString()}
                              </span>
                              {campaign.status === "active" && (
                                <span className="flex items-center text-orange-600">
                                  <Clock className="w-4 h-4 mr-1" />
                                  {campaign.daysLeft} days left
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">
                              <Edit className="w-4 h-4 mr-1" />
                              Edit
                            </Button>
                            <Button variant="outline" size="sm">
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </Button>
                            <Button variant="outline" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>

                        {/* Enhanced Progress Section */}
                        <div className="space-y-3">
                          <div className="flex justify-between text-sm">
                            <span className="font-semibold">{formatCurrency(campaign.raised)} raised</span>
                            <span>of {formatCurrency(campaign.goal)} goal</span>
                          </div>
                          <Progress value={(campaign.raised / campaign.goal) * 100} className="h-2" />

                          {/* Detailed Metrics */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-3 border-t">
                            <div className="text-center">
                              <div className="text-lg font-semibold text-gray-900">{campaign.donors}</div>
                              <div className="text-xs text-gray-600">Donors</div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-semibold text-gray-900">
                                {campaign.views.toLocaleString()}
                              </div>
                              <div className="text-xs text-gray-600">Views</div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-semibold text-gray-900">
                                {formatPercent(campaign.conversionRate)}
                              </div>
                              <div className="text-xs text-gray-600">Conversion</div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-semibold text-gray-900">
                                {formatCurrency(campaign.avgDonation)}
                              </div>
                              <div className="text-xs text-gray-600">Avg. Donation</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* New Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">Analytics & Insights</h2>
                <p className="text-gray-600">Deep dive into your campaign performance and donor behavior</p>
              </div>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </Button>
            </div>

            {/* Analytics Cards */}
            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Conversion Funnel</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Page Views</span>
                      <span className="font-semibold">15,420</span>
                    </div>
                    <Progress value={100} className="h-2" />

                    <div className="flex justify-between items-center">
                      <span className="text-sm">Engaged Users</span>
                      <span className="font-semibold">3,284</span>
                    </div>
                    <Progress value={21.3} className="h-2" />

                    <div className="flex justify-between items-center">
                      <span className="text-sm">Donors</span>
                      <span className="font-semibold">342</span>
                    </div>
                    <Progress value={10.4} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Top Performing Campaign</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <img
                        src="/placeholder.svg?height=40&width=40"
                        alt="Campaign"
                        className="w-10 h-10 rounded-lg object-cover"
                      />
                      <div>
                        <p className="font-semibold text-sm">Emergency Relief Fund</p>
                        <p className="text-xs text-gray-600">432 donors</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Conversion Rate</span>
                        <span className="font-semibold text-emerald-600">22.1%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Avg. Donation</span>
                        <span className="font-semibold">{formatCurrency(157)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Social Shares</span>
                        <span className="font-semibold">45</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Growth Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Monthly Growth</span>
                      <div className="flex items-center text-emerald-600">
                        <ArrowUpRight className="h-3 w-3 mr-1" />
                        <span className="font-semibold">+23.4%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Donor Retention</span>
                      <div className="flex items-center text-blue-600">
                        <ArrowUpRight className="h-3 w-3 mr-1" />
                        <span className="font-semibold">68.2%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Avg. Time on Page</span>
                      <span className="font-semibold">3m 24s</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Bounce Rate</span>
                      <div className="flex items-center text-red-600">
                        <ArrowDownRight className="h-3 w-3 mr-1" />
                        <span className="font-semibold">34.1%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Donor Demographics */}
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChartIcon className="h-5 w-5" />
                    Donor Demographics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      value: {
                        label: "Percentage",
                      },
                    }}
                    className="h-[300px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={donorDemographics}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          dataKey="value"
                          label={({ name, value }) => `${name}: ${value}%`}
                        >
                          {donorDemographics.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <ChartTooltip content={<ChartTooltipContent />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Campaign Categories Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { category: "Medical", amount: 82500, percentage: 64.5, color: "bg-emerald-500" },
                      { category: "Emergency", amount: 23400, percentage: 18.3, color: "bg-blue-500" },
                      { category: "Education", amount: 18750, percentage: 14.7, color: "bg-purple-500" },
                      { category: "Animals", amount: 2400, percentage: 1.9, color: "bg-orange-500" },
                      { category: "Sports", amount: 800, percentage: 0.6, color: "bg-red-500" },
                    ].map((item, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">{item.category}</span>
                          <span className="text-sm text-gray-600">{formatCurrency(item.amount)}</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${item.color}`}
                              style={{ width: `${item.percentage}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-600 w-12">{formatPercent(item.percentage)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Enhanced Donations Tab */}
          <TabsContent value="donations" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">Donation History</h2>
                <p className="text-gray-600">Track all your donations and their impact</p>
              </div>
              <div className="flex items-center gap-3">
                <Select defaultValue="all">
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>

            {/* Donation Summary Cards */}
            <div className="grid md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-5 w-5 text-emerald-600" />
                    <div>
                      <p className="text-sm text-gray-600">Total Donated</p>
                      <p className="text-lg font-semibold">{formatCurrency(425)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Heart className="h-5 w-5 text-red-600" />
                    <div>
                      <p className="text-sm text-gray-600">Campaigns Supported</p>
                      <p className="text-lg font-semibold">12</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-600">Avg. Donation</p>
                      <p className="text-lg font-semibold">{formatCurrency(35.4)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="text-sm text-gray-600">Success Rate</p>
                      <p className="text-lg font-semibold">98.5%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Enhanced Donations Table */}
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Campaign
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Method
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {donations.map((donation) => (
                        <tr key={donation.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{donation.campaignTitle}</div>
                              <div className="text-xs text-gray-500">ID: {donation.campaignId}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-semibold text-gray-900">
                                {formatCurrency(donation.amount)}
                              </div>
                              <div className="text-xs text-gray-500">
                                Fee: {formatCurrency(donation.fee)} | Net: {formatCurrency(donation.net)}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <CreditCard className="h-4 w-4 mr-2 text-gray-400" />
                              <span className="text-sm text-gray-900">{donation.method}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{new Date(donation.date).toLocaleDateString()}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge
                              variant={
                                donation.status === "completed"
                                  ? "default"
                                  : donation.status === "processing"
                                    ? "secondary"
                                    : "destructive"
                              }
                            >
                              {donation.status}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Enhanced Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">Profile Settings</h2>
                <p className="text-gray-600">Manage your account information and preferences</p>
              </div>
              <Button variant="outline">
                <Settings className="w-4 h-4 mr-2" />
                Advanced Settings
              </Button>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              {/* Profile Information */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center space-x-6">
                    <Avatar className="w-24 h-24">
                      <AvatarImage src="/placeholder.svg?height=96&width=96" />
                      <AvatarFallback className="text-lg">JS</AvatarFallback>
                    </Avatar>
                    <div className="space-y-2">
                      <Button variant="outline">
                        <Camera className="w-4 h-4 mr-2" />
                        Change Photo
                      </Button>
                      <p className="text-xs text-gray-500">JPG, PNG or GIF. Max size 2MB.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input id="firstName" defaultValue="John" />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input id="lastName" defaultValue="Smith" />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" type="email" defaultValue="john.smith@example.com" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input id="phone" defaultValue="+1 (555) 123-4567" className="pl-10" />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="location">Location</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input id="location" defaultValue="New York, NY" className="pl-10" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      rows={4}
                      defaultValue="Passionate about helping others and making a positive impact in my community. I believe in the power of collective action to create meaningful change."
                    />
                  </div>

                  <div>
                    <Label htmlFor="website">Website</Label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input id="website" defaultValue="https://johnsmith.com" className="pl-10" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Account Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>Account Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <h4 className="font-medium">Notifications</h4>
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" defaultChecked className="rounded" />
                        <span className="text-sm">Email notifications</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" defaultChecked className="rounded" />
                        <span className="text-sm">SMS notifications</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" className="rounded" />
                        <span className="text-sm">Marketing emails</span>
                      </label>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-medium">Privacy</h4>
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" defaultChecked className="rounded" />
                        <span className="text-sm">Public profile</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" className="rounded" />
                        <span className="text-sm">Show donation history</span>
                      </label>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-medium">Security</h4>
                    <Button variant="outline" size="sm" className="w-full">
                      Change Password
                    </Button>
                    <Button variant="outline" size="sm" className="w-full">
                      Two-Factor Auth
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-end space-x-4">
              <Button variant="outline">Cancel</Button>
              <Button className="bg-emerald-600 hover:bg-emerald-700">Save Changes</Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
