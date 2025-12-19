"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { uploadFile, uploadFiles, generateCampaignMediaPath } from "@/lib/storage"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  ArrowLeft,
  ArrowRight,
  Upload,
  Eye,
  CheckCircle,
  AlertCircle,
  MapPin,
  Calendar,
  DollarSign,
  Target,
  Heart,
  Camera,
  FileText,
  Gift,
  Phone,
  Mail,
  Plus,
  X,
  Info,
  Loader2,
} from "lucide-react"

const steps = [
  {
    id: 1,
    title: "Campaign Basics",
    description: "Tell us about your fundraising campaign",
    fields: ["title", "category", "location", "beneficiary"],
  },
  {
    id: 2,
    title: "Fundraising Goals",
    description: "Set your financial targets and timeline",
    fields: ["goal", "deadline", "currency", "urgency"],
  },
  {
    id: 3,
    title: "Your Story",
    description: "Share your compelling story and details",
    fields: ["story", "updates", "tags"],
  },
  {
    id: 4,
    title: "Media & Rewards",
    description: "Add photos, videos and optional rewards",
    fields: ["media", "rewards"],
  },
  {
    id: 5,
    title: "Contact & Legal",
    description: "Verification and contact information",
    fields: ["contact", "verification", "legal"],
  },
  {
    id: 6,
    title: "Review & Launch",
    description: "Review everything and publish your campaign",
    fields: [],
  },
]

export function StartFundraiser() {
  const { user } = useAuth()
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [completedFields, setCompletedFields] = useState<Set<string>>(new Set())
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({})
  
  // File input refs
  const coverImageInputRef = useRef<HTMLInputElement>(null)
  const additionalImagesInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)
  
  // Image preview URLs
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null)
  const [additionalImagesPreview, setAdditionalImagesPreview] = useState<string[]>([])
  const [videoPreview, setVideoPreview] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    // Step 1: Campaign Basics
    title: "",
    category: "",
    location: "",
    beneficiary: "",
    beneficiaryRelation: "",

    // Step 2: Fundraising Goals
    goal: "",
    deadline: "",
    currency: "USD",
    urgency: "",
    flexibleGoal: false,

    // Step 3: Your Story
    story: "",
    shortDescription: "",
    updates: "",
    tags: [] as string[],

    // Step 4: Media & Rewards
    coverImage: null as File | null,
    additionalImages: [] as File[],
    video: null as File | null,
    rewards: [] as Array<{ amount: string; title: string; description: string; delivery: string; limit: string }>,

    // Step 5: Contact & Legal
    organizerName: "",
    organizerEmail: "",
    organizerPhone: "",
    organizerBio: "",
    bankAccount: "",
    taxId: "",
    agreeTerms: false,
    agreePrivacy: false,
    verifyIdentity: false,
  })

  // Calculate progress based on completed fields
  const calculateProgress = () => {
    const currentStepFields = steps[currentStep - 1]?.fields || []
    const totalRequiredFields = steps.slice(0, currentStep).flatMap((step) => step.fields)
    const completedRequiredFields = totalRequiredFields.filter((field) => {
      switch (field) {
        case "title":
          return formData.title.length > 0
        case "category":
          return formData.category.length > 0
        case "location":
          return formData.location.length > 0
        case "beneficiary":
          return formData.beneficiary.length > 0
        case "goal":
          return formData.goal.length > 0 && Number(formData.goal) > 0
        case "deadline":
          return formData.deadline.length > 0
        case "currency":
          return formData.currency.length > 0
        case "urgency":
          return formData.urgency.length > 0
        case "story":
          return formData.story.length > 100
        case "updates":
          return true // Optional
        case "tags":
          return formData.tags.length > 0
        case "media":
          return formData.coverImage !== null
        case "rewards":
          return true // Optional
        case "contact":
          return formData.organizerName.length > 0 && formData.organizerEmail.length > 0
        case "verification":
          return formData.verifyIdentity
        case "legal":
          return formData.agreeTerms && formData.agreePrivacy
        default:
          return false
      }
    })

    const baseProgress = ((currentStep - 1) / steps.length) * 100
    const stepProgress = (completedRequiredFields.length / totalRequiredFields.length) * (100 / steps.length)
    return Math.min(baseProgress + stepProgress, 100)
  }

  const validateCurrentStep = () => {
    const newErrors: Record<string, string> = {}

    switch (currentStep) {
      case 1:
        if (!formData.title) newErrors.title = "Campaign title is required"
        if (formData.title.length < 10) newErrors.title = "Title must be at least 10 characters"
        if (!formData.category) newErrors.category = "Please select a category"
        if (!formData.location) newErrors.location = "Location is required"
        if (!formData.beneficiary) newErrors.beneficiary = "Beneficiary information is required"
        break
      case 2:
        if (!formData.goal) newErrors.goal = "Fundraising goal is required"
        if (Number(formData.goal) < 100) newErrors.goal = "Goal must be at least $100"
        if (!formData.deadline) newErrors.deadline = "Campaign deadline is required"
        if (!formData.urgency) newErrors.urgency = "Please select urgency level"
        break
      case 3:
        if (!formData.story) newErrors.story = "Campaign story is required"
        if (formData.story.length < 100) newErrors.story = "Story must be at least 100 characters"
        if (!formData.shortDescription) newErrors.shortDescription = "Short description is required"
        if (formData.tags.length === 0) newErrors.tags = "Please add at least one tag"
        break
      case 4:
        if (!formData.coverImage) newErrors.coverImage = "Cover image is required"
        break
      case 5:
        if (!formData.organizerName) newErrors.organizerName = "Your name is required"
        if (!formData.organizerEmail) newErrors.organizerEmail = "Email is required"
        if (!formData.agreeTerms) newErrors.agreeTerms = "You must agree to the terms"
        if (!formData.agreePrivacy) newErrors.agreePrivacy = "You must agree to the privacy policy"
        if (!formData.verifyIdentity) newErrors.verifyIdentity = "Identity verification is required"
        break
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const nextStep = () => {
    if (validateCurrentStep() && currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
      setErrors({})
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
      setErrors({})
    }
  }

  const addReward = () => {
    setFormData({
      ...formData,
      rewards: [...formData.rewards, { amount: "", title: "", description: "", delivery: "", limit: "" }],
    })
  }

  const updateReward = (index: number, field: keyof (typeof formData.rewards)[0], value: string) => {
    const newRewards = [...formData.rewards]
    newRewards[index][field] = value
    setFormData({ ...formData, rewards: newRewards })
  }

  const removeReward = (index: number) => {
    const newRewards = formData.rewards.filter((_, i) => i !== index)
    setFormData({ ...formData, rewards: newRewards })
  }

  const addTag = (tag: string) => {
    if (tag && !formData.tags.includes(tag)) {
      setFormData({ ...formData, tags: [...formData.tags, tag] })
    }
  }

  const removeTag = (tag: string) => {
    setFormData({ ...formData, tags: formData.tags.filter((t) => t !== tag) })
  }

  // File upload handlers
  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file
      if (!file.type.startsWith('image/')) {
        setErrors({ ...errors, coverImage: 'Please select an image file' })
        return
      }
      if (file.size > 10 * 1024 * 1024) {
        setErrors({ ...errors, coverImage: 'Image size must be less than 10MB' })
        return
      }
      
      setFormData({ ...formData, coverImage: file })
      const newErrors = { ...errors }
      delete newErrors.coverImage
      setErrors(newErrors)
      
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setCoverImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAdditionalImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      // Validate files
      const validFiles: File[] = []
      const newPreviews: string[] = []
      
      files.forEach((file, index) => {
        if (!file.type.startsWith('image/')) {
          setErrors({ ...errors, additionalImages: `File ${index + 1} is not an image` })
          return
        }
        if (file.size > 10 * 1024 * 1024) {
          setErrors({ ...errors, additionalImages: `Image ${index + 1} is too large (max 10MB)` })
          return
        }
        if (formData.additionalImages.length + validFiles.length >= 10) {
          setErrors({ ...errors, additionalImages: 'Maximum 10 additional images allowed' })
          return
        }
        
        validFiles.push(file)
        
        // Create preview
        const reader = new FileReader()
        reader.onloadend = () => {
          newPreviews.push(reader.result as string)
          if (newPreviews.length === validFiles.length) {
            setAdditionalImagesPreview([...additionalImagesPreview, ...newPreviews])
          }
        }
        reader.readAsDataURL(file)
      })
      
      setFormData({ ...formData, additionalImages: [...formData.additionalImages, ...validFiles] })
      const newErrors = { ...errors }
      delete newErrors.additionalImages
      setErrors(newErrors)
    }
  }

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file
      if (!file.type.startsWith('video/')) {
        setErrors({ ...errors, video: 'Please select a video file' })
        return
      }
      if (file.size > 100 * 1024 * 1024) {
        setErrors({ ...errors, video: 'Video size must be less than 100MB' })
        return
      }
      
      setFormData({ ...formData, video: file })
      const newErrors = { ...errors }
      delete newErrors.video
      setErrors(newErrors)
      
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setVideoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeAdditionalImage = (index: number) => {
    const newImages = formData.additionalImages.filter((_, i) => i !== index)
    const newPreviews = additionalImagesPreview.filter((_, i) => i !== index)
    setFormData({ ...formData, additionalImages: newImages })
    setAdditionalImagesPreview(newPreviews)
  }

  const removeVideo = () => {
    setFormData({ ...formData, video: null })
    setVideoPreview(null)
    if (videoInputRef.current) {
      videoInputRef.current.value = ''
    }
  }

  const handleLaunchCampaign = async () => {
    if (!user) {
      setErrors({ general: 'You must be logged in to create a campaign' })
      return
    }

    if (!validateCurrentStep()) {
      return
    }

    setIsSubmitting(true)
    setErrors({})

    try {
      // Get auth token
      const token = await user.getIdToken()
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

      // Upload cover image first (required)
      let coverImageUrl = ''
      if (formData.coverImage) {
        try {
          const tempCampaignId = `temp-${Date.now()}`
          const coverImagePath = generateCampaignMediaPath(tempCampaignId, formData.coverImage.name, 'cover')
          
          setUploadProgress({ coverImage: 0 })
          coverImageUrl = await uploadFile(
            formData.coverImage,
            coverImagePath,
            (progress) => setUploadProgress(prev => ({ ...prev, coverImage: progress }))
          )
          setUploadProgress({ coverImage: 100 })
        } catch (error: any) {
          setErrors({ coverImage: error.message || 'Failed to upload cover image' })
          setIsSubmitting(false)
          return
        }
      }

      // Upload additional images
      const additionalImageUrls: string[] = []
      if (formData.additionalImages.length > 0) {
        try {
          const tempCampaignId = `temp-${Date.now()}`
          const imagePaths = formData.additionalImages.map((file, index) => 
            generateCampaignMediaPath(tempCampaignId, file.name, 'image')
          )
          
          setUploadProgress(prev => ({ ...prev, additionalImages: 0 }))
          const uploadedUrls = await uploadFiles(
            formData.additionalImages,
            `campaigns/${tempCampaignId}/images`,
            (index, progress) => {
              setUploadProgress(prev => ({ 
                ...prev, 
                additionalImages: Math.max(prev.additionalImages || 0, progress) 
              }))
            }
          )
          additionalImageUrls.push(...uploadedUrls)
          setUploadProgress(prev => ({ ...prev, additionalImages: 100 }))
        } catch (error: any) {
          console.warn('Failed to upload some additional images:', error)
          // Continue even if additional images fail
        }
      }

      // Upload video
      let videoUrl = ''
      if (formData.video) {
        try {
          const tempCampaignId = `temp-${Date.now()}`
          const videoPath = generateCampaignMediaPath(tempCampaignId, formData.video.name, 'video')
          
          setUploadProgress(prev => ({ ...prev, video: 0 }))
          videoUrl = await uploadFile(
            formData.video,
            videoPath,
            (progress) => setUploadProgress(prev => ({ ...prev, video: progress }))
          )
          setUploadProgress(prev => ({ ...prev, video: 100 }))
        } catch (error: any) {
          console.warn('Failed to upload video:', error)
          // Continue even if video fails
        }
      }

      // Calculate deadline
      const deadlineDate = formData.deadline 
        ? new Date(formData.deadline)
        : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // Default 30 days

      // Calculate duration in days
      const duration = Math.ceil((deadlineDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))

      // Prepare campaign data
      const campaignData = {
        title: formData.title,
        description: formData.shortDescription || formData.story.substring(0, 500),
        story: formData.story,
        category: formData.category,
        goal: parseFloat(formData.goal),
        currency: formData.currency,
        cover_image: coverImageUrl,
        country: formData.location.split(',')[2]?.trim() || '',
        postcode: '',
        who_for: formData.beneficiary,
        duration: duration,
        deadline: deadlineDate.toISOString(), // Backend will parse this
        organizer_name: formData.organizerName,
        location: formData.location,
        // Additional fields
        tags: formData.tags,
        additional_images: additionalImageUrls,
        video_url: videoUrl,
        beneficiary_relation: formData.beneficiaryRelation,
        urgency: formData.urgency,
        flexible_goal: formData.flexibleGoal,
        updates: formData.updates,
        organizer_email: formData.organizerEmail,
        organizer_phone: formData.organizerPhone,
        organizer_bio: formData.organizerBio,
      }

      // Create campaign via API
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 60000) // 60 second timeout

      const response = await fetch(`${apiUrl}/api/campaign/create`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(campaignData),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to create campaign' }))
        throw new Error(errorData.error || errorData.message || 'Failed to create campaign')
      }

      const result = await response.json()
      const campaignId = result.campaign?.id || result.campaign_id

      // Redirect to campaign page or dashboard
      if (campaignId) {
        router.push(`/campaign/${campaignId}`)
      } else {
        router.push('/dashboard')
      }
    } catch (error: any) {
      console.error('Campaign creation error:', error)
      setErrors({ 
        general: error.message || 'Failed to create campaign. Please try again.' 
      })
    } finally {
      setIsSubmitting(false)
      setUploadProgress({})
    }
  }

  const progress = calculateProgress()

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Enhanced Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Start Your Fundraiser</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Create a compelling campaign to raise money for what matters most to you. We'll guide you through every step
            of the process.
          </p>
        </div>

        {/* Enhanced Progress Section */}
        <div className="mb-8">
          {/* Step Indicators */}
          <div className="flex justify-between items-center mb-6 overflow-x-auto pb-2">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center min-w-0">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${
                      currentStep >= step.id
                        ? "bg-emerald-600 text-white shadow-lg"
                        : currentStep === step.id - 1
                          ? "bg-emerald-100 text-emerald-600 border-2 border-emerald-600"
                          : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {currentStep > step.id ? <CheckCircle className="w-5 h-5" /> : step.id}
                  </div>
                  <div className="mt-2 text-center">
                    <div
                      className={`text-xs font-medium ${currentStep >= step.id ? "text-emerald-600" : "text-gray-500"}`}
                    >
                      {step.title}
                    </div>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-1 mx-4 rounded transition-all duration-300 ${
                      currentStep > step.id ? "bg-emerald-600" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <Progress value={progress} className="h-3 bg-gray-200" />
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">
                Step {currentStep} of {steps.length}
              </span>
              <span className="text-emerald-600 font-medium">{Math.round(progress)}% Complete</span>
            </div>
          </div>

          {/* Current Step Info */}
          <div className="text-center mt-4">
            <Badge variant="outline" className="text-sm px-4 py-2">
              {steps[currentStep - 1].title}: {steps[currentStep - 1].description}
            </Badge>
          </div>
        </div>

        {/* Enhanced Form Content */}
        <Card className="shadow-xl border-0">
          <CardHeader className="bg-white rounded-t-lg">
            <CardTitle className="text-2xl text-center text-gray-900">{steps[currentStep - 1].title}</CardTitle>
            <p className="text-gray-600 text-center">{steps[currentStep - 1].description}</p>
          </CardHeader>
          <CardContent className="p-8 space-y-8">
            {/* Step 1: Campaign Basics */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <Label htmlFor="title" className="text-base font-semibold">
                      Campaign Title *
                    </Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Give your campaign a clear, compelling title"
                      className={`mt-2 h-12 text-lg ${errors.title ? "border-red-500" : ""}`}
                    />
                    {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
                    <p className="text-sm text-gray-500 mt-1">
                      {formData.title.length}/80 characters. Make it specific and emotional.
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="category" className="text-base font-semibold">
                      Category *
                    </Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData({ ...formData, category: value })}
                    >
                      <SelectTrigger className={`mt-2 h-12 ${errors.category ? "border-red-500" : ""}`}>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="medical">Medical & Health</SelectItem>
                        <SelectItem value="emergency">Emergency & Crisis</SelectItem>
                        <SelectItem value="education">Education & Learning</SelectItem>
                        <SelectItem value="community">Community & Social</SelectItem>
                        <SelectItem value="animals">Animals & Pets</SelectItem>
                        <SelectItem value="sports">Sports & Recreation</SelectItem>
                        <SelectItem value="memorial">Memorial & Funeral</SelectItem>
                        <SelectItem value="business">Business & Startup</SelectItem>
                        <SelectItem value="creative">Creative & Arts</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
                  </div>

                  <div>
                    <Label htmlFor="location" className="text-base font-semibold">
                      Location *
                    </Label>
                    <div className="relative mt-2">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        placeholder="City, State, Country"
                        className={`pl-12 h-12 ${errors.location ? "border-red-500" : ""}`}
                      />
                    </div>
                    {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location}</p>}
                  </div>

                  <div>
                    <Label htmlFor="beneficiary" className="text-base font-semibold">
                      Who will benefit? *
                    </Label>
                    <Select
                      value={formData.beneficiary}
                      onValueChange={(value) => setFormData({ ...formData, beneficiary: value })}
                    >
                      <SelectTrigger className={`mt-2 h-12 ${errors.beneficiary ? "border-red-500" : ""}`}>
                        <SelectValue placeholder="Select beneficiary" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="myself">Myself</SelectItem>
                        <SelectItem value="family">Family Member</SelectItem>
                        <SelectItem value="friend">Friend</SelectItem>
                        <SelectItem value="organization">Organization/Charity</SelectItem>
                        <SelectItem value="community">Community</SelectItem>
                        <SelectItem value="other">Someone else</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.beneficiary && <p className="text-red-500 text-sm mt-1">{errors.beneficiary}</p>}
                  </div>

                  <div>
                    <Label htmlFor="beneficiaryRelation" className="text-base font-semibold">
                      Your relationship to beneficiary
                    </Label>
                    <Input
                      id="beneficiaryRelation"
                      value={formData.beneficiaryRelation}
                      onChange={(e) => setFormData({ ...formData, beneficiaryRelation: e.target.value })}
                      placeholder="e.g., Brother, Friend, Organizer"
                      className="mt-2 h-12"
                    />
                  </div>
                </div>

                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Choose your category carefully as it helps donors find your campaign and affects our promotional
                    features.
                  </AlertDescription>
                </Alert>
              </div>
            )}

            {/* Step 2: Fundraising Goals */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="goal" className="text-base font-semibold">
                      Fundraising Goal *
                    </Label>
                    <div className="relative mt-2">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                      <Input
                        id="goal"
                        type="number"
                        value={formData.goal}
                        onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                        placeholder="0"
                        className={`pl-12 h-12 text-lg ${errors.goal ? "border-red-500" : ""}`}
                      />
                    </div>
                    {errors.goal && <p className="text-red-500 text-sm mt-1">{errors.goal}</p>}
                    <p className="text-sm text-gray-500 mt-1">Set a realistic goal. You can always adjust it later.</p>
                  </div>

                  <div>
                    <Label htmlFor="currency" className="text-base font-semibold">
                      Currency
                    </Label>
                    <Select
                      value={formData.currency}
                      onValueChange={(value) => setFormData({ ...formData, currency: value })}
                    >
                      <SelectTrigger className="mt-2 h-12">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD - US Dollar</SelectItem>
                        <SelectItem value="EUR">EUR - Euro</SelectItem>
                        <SelectItem value="GBP">GBP - British Pound</SelectItem>
                        <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                        <SelectItem value="AUD">AUD - Australian Dollar</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="deadline" className="text-base font-semibold">
                      Campaign Deadline *
                    </Label>
                    <div className="relative mt-2">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                      <Input
                        id="deadline"
                        type="date"
                        value={formData.deadline}
                        onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                        className={`pl-12 h-12 ${errors.deadline ? "border-red-500" : ""}`}
                        min={new Date().toISOString().split("T")[0]}
                      />
                    </div>
                    {errors.deadline && <p className="text-red-500 text-sm mt-1">{errors.deadline}</p>}
                  </div>

                  <div>
                    <Label htmlFor="urgency" className="text-base font-semibold">
                      Urgency Level *
                    </Label>
                    <Select
                      value={formData.urgency}
                      onValueChange={(value) => setFormData({ ...formData, urgency: value })}
                    >
                      <SelectTrigger className={`mt-2 h-12 ${errors.urgency ? "border-red-500" : ""}`}>
                        <SelectValue placeholder="How urgent is this?" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="critical">Critical - Immediate need</SelectItem>
                        <SelectItem value="urgent">Urgent - Within weeks</SelectItem>
                        <SelectItem value="moderate">Moderate - Within months</SelectItem>
                        <SelectItem value="flexible">Flexible - No rush</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.urgency && <p className="text-red-500 text-sm mt-1">{errors.urgency}</p>}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="flexibleGoal"
                    checked={formData.flexibleGoal}
                    onCheckedChange={(checked) => setFormData({ ...formData, flexibleGoal: checked as boolean })}
                  />
                  <Label htmlFor="flexibleGoal" className="text-sm">
                    Allow flexible funding (keep donations even if goal isn't reached)
                  </Label>
                </div>

                <Alert>
                  <Target className="h-4 w-4" />
                  <AlertDescription>
                    Campaigns with deadlines tend to create more urgency and receive more donations. Consider setting a
                    deadline 30-60 days from now.
                  </AlertDescription>
                </Alert>
              </div>
            )}

            {/* Step 3: Your Story */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <Label htmlFor="shortDescription" className="text-base font-semibold">
                    Short Description *
                  </Label>
                  <Textarea
                    id="shortDescription"
                    value={formData.shortDescription}
                    onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                    placeholder="Write a compelling one-sentence summary of your campaign..."
                    rows={2}
                    className={`mt-2 ${errors.shortDescription ? "border-red-500" : ""}`}
                  />
                  {errors.shortDescription && <p className="text-red-500 text-sm mt-1">{errors.shortDescription}</p>}
                  <p className="text-sm text-gray-500 mt-1">
                    {formData.shortDescription.length}/150 characters. This appears in search results.
                  </p>
                </div>

                <div>
                  <Label htmlFor="story" className="text-base font-semibold">
                    Full Campaign Story *
                  </Label>
                  <Textarea
                    id="story"
                    value={formData.story}
                    onChange={(e) => setFormData({ ...formData, story: e.target.value })}
                    placeholder="Tell your story in detail. Explain why you're fundraising, how the money will be used, and why people should support your cause. Be honest, specific, and heartfelt..."
                    rows={12}
                    className={`mt-2 ${errors.story ? "border-red-500" : ""}`}
                  />
                  {errors.story && <p className="text-red-500 text-sm mt-1">{errors.story}</p>}
                  <p className="text-sm text-gray-500 mt-1">
                    {formData.story.length} characters. Aim for at least 100 characters. Include specific details and
                    emotional connection.
                  </p>
                </div>

                <div>
                  <Label className="text-base font-semibold">Campaign Tags *</Label>
                  <div className="mt-2 space-y-3">
                    <div className="flex flex-wrap gap-2">
                      {formData.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="px-3 py-1">
                          {tag}
                          <button onClick={() => removeTag(tag)} className="ml-2 text-gray-500 hover:text-red-500">
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add a tag (press Enter)"
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault()
                            addTag(e.currentTarget.value)
                            e.currentTarget.value = ""
                          }
                        }}
                        className="flex-1"
                      />
                    </div>
                    {errors.tags && <p className="text-red-500 text-sm mt-1">{errors.tags}</p>}
                    <p className="text-sm text-gray-500">
                      Add relevant tags to help people discover your campaign. Examples: medical, family, emergency,
                      education
                    </p>
                  </div>
                </div>

                <div>
                  <Label htmlFor="updates" className="text-base font-semibold">
                    Planned Updates
                  </Label>
                  <Textarea
                    id="updates"
                    value={formData.updates}
                    onChange={(e) => setFormData({ ...formData, updates: e.target.value })}
                    placeholder="How will you keep donors updated on your progress? (Optional)"
                    rows={4}
                    className="mt-2"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Regular updates help maintain donor engagement and trust.
                  </p>
                </div>

                <Alert>
                  <FileText className="h-4 w-4" />
                  <AlertDescription>
                    A compelling story is crucial for success. Include specific details about your situation, how
                    donations will be used, and why this matters to you.
                  </AlertDescription>
                </Alert>
              </div>
            )}

            {/* Step 4: Media & Rewards */}
            {currentStep === 4 && (
              <div className="space-y-8">
                {/* Cover Image */}
                <div>
                  <Label className="text-base font-semibold">Cover Image *</Label>
                  <input
                    ref={coverImageInputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                    onChange={handleCoverImageChange}
                    className="hidden"
                  />
                  {coverImagePreview ? (
                    <div className="mt-2 space-y-2">
                      <div className="relative w-full h-64 rounded-lg overflow-hidden border-2 border-gray-200">
                        <Image
                          src={coverImagePreview}
                          alt="Cover preview"
                          fill
                          className="object-cover"
                        />
                        <Button
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={() => {
                            setFormData({ ...formData, coverImage: null })
                            setCoverImagePreview(null)
                            if (coverImageInputRef.current) {
                              coverImageInputRef.current.value = ''
                            }
                          }}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                      {uploadProgress.coverImage !== undefined && uploadProgress.coverImage < 100 && (
                        <div className="space-y-1">
                          <Progress value={uploadProgress.coverImage} />
                          <p className="text-xs text-gray-500">Uploading: {Math.round(uploadProgress.coverImage)}%</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div
                      className={`mt-2 border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
                        errors.coverImage
                          ? "border-red-500 bg-red-50"
                          : "border-gray-300 hover:border-emerald-400 bg-gray-50"
                      }`}
                      onClick={() => coverImageInputRef.current?.click()}
                    >
                      <Camera className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <div className="space-y-2">
                        <Button 
                          variant="outline" 
                          className="mb-2"
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            coverImageInputRef.current?.click()
                          }}
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          Choose Cover Image
                        </Button>
                        <p className="text-sm text-gray-600">Upload a compelling photo that represents your campaign</p>
                        <p className="text-xs text-gray-500">Recommended: 1200x630px, JPG or PNG, max 10MB</p>
                      </div>
                    </div>
                  )}
                  {errors.coverImage && <p className="text-red-500 text-sm mt-1">{errors.coverImage}</p>}
                </div>

                {/* Additional Images */}
                <div>
                  <Label className="text-base font-semibold">Additional Images (Optional)</Label>
                  <input
                    ref={additionalImagesInputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                    multiple
                    onChange={handleAdditionalImagesChange}
                    className="hidden"
                  />
                  {additionalImagesPreview.length > 0 && (
                    <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-4">
                      {additionalImagesPreview.map((preview, index) => (
                        <div key={index} className="relative aspect-video rounded-lg overflow-hidden border-2 border-gray-200">
                          <Image
                            src={preview}
                            alt={`Additional image ${index + 1}`}
                            fill
                            className="object-cover"
                          />
                          <Button
                            variant="destructive"
                            size="sm"
                            className="absolute top-1 right-1 h-6 w-6 p-0"
                            onClick={() => removeAdditionalImage(index)}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                  <div 
                    className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-emerald-400 transition-colors cursor-pointer"
                    onClick={() => additionalImagesInputRef.current?.click()}
                  >
                    <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                    <Button 
                      variant="outline" 
                      size="sm"
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        additionalImagesInputRef.current?.click()
                      }}
                    >
                      Add More Images
                    </Button>
                    <p className="text-xs text-gray-500 mt-2">
                      Add up to 10 additional images to tell your story better ({formData.additionalImages.length}/10)
                    </p>
                  </div>
                  {errors.additionalImages && <p className="text-red-500 text-sm mt-1">{errors.additionalImages}</p>}
                  {uploadProgress.additionalImages !== undefined && uploadProgress.additionalImages < 100 && (
                    <div className="mt-2 space-y-1">
                      <Progress value={uploadProgress.additionalImages} />
                      <p className="text-xs text-gray-500">Uploading: {Math.round(uploadProgress.additionalImages)}%</p>
                    </div>
                  )}
                </div>

                {/* Video */}
                <div>
                  <Label className="text-base font-semibold">Campaign Video (Optional)</Label>
                  <input
                    ref={videoInputRef}
                    type="file"
                    accept="video/mp4,video/mov,video/avi,video/webm"
                    onChange={handleVideoChange}
                    className="hidden"
                  />
                  {videoPreview ? (
                    <div className="mt-2 space-y-2">
                      <div className="relative w-full aspect-video rounded-lg overflow-hidden border-2 border-gray-200 bg-black">
                        <video
                          src={videoPreview}
                          controls
                          className="w-full h-full object-contain"
                        />
                        <Button
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={removeVideo}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                      {uploadProgress.video !== undefined && uploadProgress.video < 100 && (
                        <div className="space-y-1">
                          <Progress value={uploadProgress.video} />
                          <p className="text-xs text-gray-500">Uploading: {Math.round(uploadProgress.video)}%</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div 
                      className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-emerald-400 transition-colors cursor-pointer"
                      onClick={() => videoInputRef.current?.click()}
                    >
                      <FileText className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                      <Button 
                        variant="outline" 
                        size="sm"
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          videoInputRef.current?.click()
                        }}
                      >
                        Upload Video
                      </Button>
                      <p className="text-xs text-gray-500 mt-2">
                        MP4, MOV, AVI, or WebM. Max 100MB. Videos can increase donations by up to 30%
                      </p>
                    </div>
                  )}
                  {errors.video && <p className="text-red-500 text-sm mt-1">{errors.video}</p>}
                </div>

                <Separator />

                {/* Rewards Section */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <Label className="text-base font-semibold">Donation Rewards (Optional)</Label>
                      <p className="text-sm text-gray-500 mt-1">Offer rewards to encourage larger donations</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={addReward}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Reward Tier
                    </Button>
                  </div>

                  {formData.rewards.map((reward, index) => (
                    <Card key={index} className="p-4 space-y-4 mb-4">
                      <div className="flex justify-between items-center">
                        <h4 className="font-medium flex items-center">
                          <Gift className="w-4 h-4 mr-2" />
                          Reward Tier {index + 1}
                        </h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeReward(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Minimum Donation *</Label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <Input
                              type="number"
                              value={reward.amount}
                              onChange={(e) => updateReward(index, "amount", e.target.value)}
                              placeholder="0"
                              className="pl-10"
                            />
                          </div>
                        </div>
                        <div>
                          <Label>Reward Title *</Label>
                          <Input
                            value={reward.title}
                            onChange={(e) => updateReward(index, "title", e.target.value)}
                            placeholder="e.g., Thank You Card"
                          />
                        </div>
                      </div>

                      <div>
                        <Label>Reward Description *</Label>
                        <Textarea
                          value={reward.description}
                          onChange={(e) => updateReward(index, "description", e.target.value)}
                          placeholder="Describe what donors will receive..."
                          rows={2}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Estimated Delivery</Label>
                          <Input
                            value={reward.delivery}
                            onChange={(e) => updateReward(index, "delivery", e.target.value)}
                            placeholder="e.g., 2 weeks after campaign ends"
                          />
                        </div>
                        <div>
                          <Label>Quantity Limit (Optional)</Label>
                          <Input
                            type="number"
                            value={reward.limit}
                            onChange={(e) => updateReward(index, "limit", e.target.value)}
                            placeholder="Unlimited"
                          />
                        </div>
                      </div>
                    </Card>
                  ))}

                  {formData.rewards.length === 0 && (
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                      <Gift className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <p className="text-gray-600 mb-2">No rewards added yet</p>
                      <p className="text-sm text-gray-500">Rewards are optional but can encourage larger donations</p>
                    </div>
                  )}
                </div>

                <Alert>
                  <Camera className="h-4 w-4" />
                  <AlertDescription>
                    Campaigns with high-quality images raise 3x more money. Make sure your cover image is clear,
                    compelling, and directly related to your cause.
                  </AlertDescription>
                </Alert>
              </div>
            )}

            {/* Step 5: Contact & Legal */}
            {currentStep === 5 && (
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="organizerName" className="text-base font-semibold">
                      Your Full Name *
                    </Label>
                    <Input
                      id="organizerName"
                      value={formData.organizerName}
                      onChange={(e) => setFormData({ ...formData, organizerName: e.target.value })}
                      placeholder="Enter your full legal name"
                      className={`mt-2 h-12 ${errors.organizerName ? "border-red-500" : ""}`}
                    />
                    {errors.organizerName && <p className="text-red-500 text-sm mt-1">{errors.organizerName}</p>}
                  </div>

                  <div>
                    <Label htmlFor="organizerEmail" className="text-base font-semibold">
                      Email Address *
                    </Label>
                    <div className="relative mt-2">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                      <Input
                        id="organizerEmail"
                        type="email"
                        value={formData.organizerEmail}
                        onChange={(e) => setFormData({ ...formData, organizerEmail: e.target.value })}
                        placeholder="your.email@example.com"
                        className={`pl-12 h-12 ${errors.organizerEmail ? "border-red-500" : ""}`}
                      />
                    </div>
                    {errors.organizerEmail && <p className="text-red-500 text-sm mt-1">{errors.organizerEmail}</p>}
                  </div>

                  <div>
                    <Label htmlFor="organizerPhone" className="text-base font-semibold">
                      Phone Number
                    </Label>
                    <div className="relative mt-2">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                      <Input
                        id="organizerPhone"
                        value={formData.organizerPhone}
                        onChange={(e) => setFormData({ ...formData, organizerPhone: e.target.value })}
                        placeholder="+1 (555) 123-4567"
                        className="pl-12 h-12"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="bankAccount" className="text-base font-semibold">
                      Bank Account (Last 4 digits)
                    </Label>
                    <Input
                      id="bankAccount"
                      value={formData.bankAccount}
                      onChange={(e) => setFormData({ ...formData, bankAccount: e.target.value })}
                      placeholder="****1234"
                      className="mt-2 h-12"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      For verification purposes only. Full details collected securely later.
                    </p>
                  </div>
                </div>

                <div>
                  <Label htmlFor="organizerBio" className="text-base font-semibold">
                    About You
                  </Label>
                  <Textarea
                    id="organizerBio"
                    value={formData.organizerBio}
                    onChange={(e) => setFormData({ ...formData, organizerBio: e.target.value })}
                    placeholder="Tell donors a bit about yourself and why you're organizing this campaign..."
                    rows={4}
                    className="mt-2"
                  />
                </div>

                <Separator />

                {/* Verification */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Verification & Legal</h3>

                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="verifyIdentity"
                        checked={formData.verifyIdentity}
                        onCheckedChange={(checked) => setFormData({ ...formData, verifyIdentity: checked as boolean })}
                        className="mt-1"
                      />
                      <div>
                        <Label htmlFor="verifyIdentity" className="text-sm font-medium">
                          I agree to verify my identity *
                        </Label>
                        <p className="text-xs text-gray-500">
                          We may require government-issued ID verification before funds are released
                        </p>
                      </div>
                    </div>
                    {errors.verifyIdentity && <p className="text-red-500 text-sm">{errors.verifyIdentity}</p>}

                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="agreeTerms"
                        checked={formData.agreeTerms}
                        onCheckedChange={(checked) => setFormData({ ...formData, agreeTerms: checked as boolean })}
                        className="mt-1"
                      />
                      <div>
                        <Label htmlFor="agreeTerms" className="text-sm font-medium">
                          I agree to the Terms of Service *
                        </Label>
                        <p className="text-xs text-gray-500">
                          <a href="/terms" className="text-emerald-600 hover:underline">
                            Read our Terms of Service
                          </a>
                        </p>
                      </div>
                    </div>
                    {errors.agreeTerms && <p className="text-red-500 text-sm">{errors.agreeTerms}</p>}

                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="agreePrivacy"
                        checked={formData.agreePrivacy}
                        onCheckedChange={(checked) => setFormData({ ...formData, agreePrivacy: checked as boolean })}
                        className="mt-1"
                      />
                      <div>
                        <Label htmlFor="agreePrivacy" className="text-sm font-medium">
                          I agree to the Privacy Policy *
                        </Label>
                        <p className="text-xs text-gray-500">
                          <a href="/privacy" className="text-emerald-600 hover:underline">
                            Read our Privacy Policy
                          </a>
                        </p>
                      </div>
                    </div>
                    {errors.agreePrivacy && <p className="text-red-500 text-sm">{errors.agreePrivacy}</p>}
                  </div>
                </div>

                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    All information is encrypted and secure. We use bank-level security to protect your data. Identity
                    verification helps prevent fraud and builds donor trust.
                  </AlertDescription>
                </Alert>
              </div>
            )}

            {/* Step 6: Review & Launch */}
            {currentStep === 6 && (
              <div className="space-y-8">
                <div className="bg-emerald-50 p-6 rounded-lg border border-emerald-200">
                  <h3 className="font-semibold text-emerald-800 mb-4 flex items-center">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Campaign Preview
                  </h3>
                  <div className="grid md:grid-cols-2 gap-6 text-sm">
                    <div className="space-y-3">
                      <div>
                        <span className="font-medium text-gray-700">Title:</span>
                        <p className="text-gray-900">{formData.title || "Not set"}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Category:</span>
                        <p className="text-gray-900">{formData.category || "Not set"}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Location:</span>
                        <p className="text-gray-900">{formData.location || "Not set"}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Beneficiary:</span>
                        <p className="text-gray-900">{formData.beneficiary || "Not set"}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Goal:</span>
                        <p className="text-gray-900">
                          {formData.currency} {formData.goal || "0"}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <span className="font-medium text-gray-700">Deadline:</span>
                        <p className="text-gray-900">{formData.deadline || "No deadline"}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Urgency:</span>
                        <p className="text-gray-900">{formData.urgency || "Not set"}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Story Length:</span>
                        <p className="text-gray-900">{formData.story.length} characters</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Tags:</span>
                        <p className="text-gray-900">{formData.tags.length} tags</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Rewards:</span>
                        <p className="text-gray-900">{formData.rewards.length} reward tiers</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-center space-y-4">
                  <Button variant="outline" className="mb-4">
                    <Eye className="w-4 h-4 mr-2" />
                    Preview Campaign Page
                  </Button>
                  <p className="text-sm text-gray-600">
                    Review your campaign carefully before publishing. You can edit most details later, but some changes
                    may require re-verification.
                  </p>
                </div>

                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Ready to launch!</strong> Your campaign will be reviewed within 24 hours. You'll receive an
                    email confirmation once it's live.
                  </AlertDescription>
                </Alert>
              </div>
            )}

            {/* Error Alert */}
            {errors.general && (
              <Alert variant="destructive" className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errors.general}</AlertDescription>
              </Alert>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-8 border-t">
              <Button variant="outline" onClick={prevStep} disabled={currentStep === 1 || isSubmitting} className="px-6">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>

              {currentStep < steps.length ? (
                <Button onClick={nextStep} disabled={isSubmitting} className="bg-emerald-600 hover:bg-emerald-700 px-6">
                  Next Step
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button 
                  onClick={handleLaunchCampaign} 
                  disabled={isSubmitting}
                  className="bg-emerald-600 hover:bg-emerald-700 px-8"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating Campaign...
                    </>
                  ) : (
                    <>
                      <Heart className="w-4 h-4 mr-2" />
                      Launch Campaign
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
