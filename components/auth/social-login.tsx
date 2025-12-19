"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, XCircle } from "lucide-react"
import { FaGoogle } from "react-icons/fa"
import { GrApple } from "react-icons/gr"
import { SiFacebook } from "react-icons/si"
import { useAuth } from "@/contexts/auth-context"

interface SocialProvider {
  id: string
  name: string
  icon: any
  color: string
  handler: () => Promise<void>
}

export default function SocialLogin() {
  const { signInWithGoogle, signInWithFacebook, signInWithApple } = useAuth()
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null)

  const providers: SocialProvider[] = [
    {
      id: "google",
      name: "Google",
      icon: <FaGoogle />,
      color: "hover:bg-red-50 dark:hover:bg-red-900/20 border-red-200 dark:border-red-800",
      handler: signInWithGoogle,
    },
    {
      id: "facebook",
      name: "Facebook",
      icon: <SiFacebook />,
      color: "hover:bg-blue-50 dark:hover:bg-blue-900/20 border-blue-200 dark:border-blue-800",
      handler: signInWithFacebook,
    },
    {
      id: "apple",
      name: "Apple",
      icon: <GrApple />,
      color: "hover:bg-gray-50 dark:hover:bg-gray-800 border-gray-200 dark:border-gray-700",
      handler: signInWithApple,
    },
  ]

  const [error, setError] = useState<string | null>(null)

  const handleSocialLogin = async (provider: SocialProvider) => {
    setLoadingProvider(provider.id)
    setError(null)
    try {
      await provider.handler()
    } catch (error: any) {
      console.error(`${provider.name} login failed:`, error)
      
      // Extract user-friendly error message
      let errorMessage = `${provider.name} sign-in failed. Please try again.`
      
      if (error.message) {
        errorMessage = error.message
      } else if (error.code) {
        switch (error.code) {
          case 'auth/popup-closed-by-user':
            errorMessage = 'Sign-in was cancelled. Please try again.'
            break
          case 'auth/popup-blocked':
            errorMessage = 'Popup was blocked. Please allow popups for this site.'
            break
          case 'auth/account-exists-with-different-credential':
            errorMessage = 'An account already exists with this email using a different sign-in method.'
            break
          case 'auth/network-request-failed':
            errorMessage = 'Network error. Please check your connection.'
            break
          case 'auth/unauthorized-domain':
            errorMessage = 'This domain is not authorized for sign-in.'
            break
          case 'auth/operation-not-allowed':
            errorMessage = `${provider.name} sign-in is not enabled. Please contact support.`
            break
          case 'auth/invalid-credential':
            errorMessage = 'Invalid credentials. Please try again.'
            break
          default:
            errorMessage = error.message || `${provider.name} sign-in failed. Please try again.`
        }
      }
      
      setError(errorMessage)
      
      // Clear error after 5 seconds
      setTimeout(() => setError(null), 5000)
    } finally {
      setLoadingProvider(null)
    }
  }

  return (
    <div className="space-y-3">
      {error && (
        <Alert variant="destructive" className="border-red-200 bg-red-50">
          <XCircle className="h-4 w-4" />
          <AlertDescription className="text-sm">{error}</AlertDescription>
        </Alert>
      )}
      
      {providers.map((provider) => (
        <Button
          key={provider.id}
          onClick={() => handleSocialLogin(provider)}
          disabled={loadingProvider !== null}
          variant="outline"
          className={`w-full h-11 ${provider.color} transition-all duration-200 font-medium`}
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
