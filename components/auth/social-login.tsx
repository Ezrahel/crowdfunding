"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { FaGoogle } from "react-icons/fa";
import { GrApple } from "react-icons/gr";
import { SiFacebook } from "react-icons/si";
interface SocialProvider {
  id: string
  name: string
  icon: any
  color: string
}

const providers: SocialProvider[] = [
  {
    id: "google",
    name: "Google",
    icon: <FaGoogle />,
    color: "hover:bg-red-50 dark:hover:bg-red-900/20 border-red-200 dark:border-red-800",
  },
  {
    id: "facebook",
    name: "Facebook",
    icon: <SiFacebook />,
    color: "hover:bg-blue-50 dark:hover:bg-blue-900/20 border-blue-200 dark:border-blue-800",
  },
  {
    id: "apple",
    name: "Apple",
    icon: <GrApple />,
    color: "hover:bg-gray-50 dark:hover:bg-gray-800 border-gray-200 dark:border-gray-700",
  },
]

export default function SocialLogin() {
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null)

  const handleSocialLogin = async (providerId: string) => {
    setLoadingProvider(providerId)

    try {
      // Simulate OAuth flow
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Redirect to dashboard or handle OAuth callback
      window.location.href = "/dashboard"
    } catch (error) {
      console.error("Social login failed:", error)
    } finally {
      setLoadingProvider(null)
    }
  }

  return (
    <div className="space-y-3">
      {providers.map((provider) => (
        <Button
          key={provider.id}
          onClick={() => handleSocialLogin(provider.id)}
          disabled={loadingProvider !== null}
          variant="outline"
          className={`w-full ${provider.color} transition-colors`}
        >
          {loadingProvider === provider.id ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <span className="mr-2 text-lg">{provider.icon}</span>
          )}
          Continue with {provider.name}
        </Button>
      ))}
    </div>
  )
}
