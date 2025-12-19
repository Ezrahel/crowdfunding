"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Check, X, AlertCircle } from "lucide-react"
import { FaGoogle } from "react-icons/fa"
import { SiFacebook } from "react-icons/si"
import { GrApple } from "react-icons/gr"
import { useAuth } from "@/contexts/auth-context"

interface LinkedProvider {
  id: string
  name: string
  icon: any
  providerId: string
}

export default function AccountLinking() {
  const { user, linkAccount, unlinkAccount } = useAuth()
  const [linkedProviders, setLinkedProviders] = useState<string[]>([])
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      // Extract provider IDs from user's provider data
      const providers = user.providerData.map(p => {
        // Convert Firebase provider IDs to our format
        if (p.providerId === 'google.com') return 'google'
        if (p.providerId === 'facebook.com') return 'facebook'
        if (p.providerId === 'apple.com') return 'apple'
        if (p.providerId === 'password') return 'email'
        return p.providerId
      })
      setLinkedProviders(providers)
    }
  }, [user])

  const allProviders: LinkedProvider[] = [
    {
      id: "google",
      name: "Google",
      icon: <FaGoogle />,
      providerId: "google.com",
    },
    {
      id: "facebook",
      name: "Facebook",
      icon: <SiFacebook />,
      providerId: "facebook.com",
    },
    {
      id: "apple",
      name: "Apple",
      icon: <GrApple />,
      providerId: "apple.com",
    },
  ]

  const handleLink = async (provider: LinkedProvider) => {
    if (!user) return

    setLoading(`link-${provider.id}`)
    setError(null)
    setSuccess(null)

    try {
      await linkAccount(provider.id as 'google' | 'facebook' | 'apple')
      setSuccess(`${provider.name} account linked successfully!`)
      setLinkedProviders([...linkedProviders, provider.id])
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000)
    } catch (err: any) {
      console.error('Link account error:', err)
      setError(err.message || `Failed to link ${provider.name} account`)
      
      // Clear error after 5 seconds
      setTimeout(() => setError(null), 5000)
    } finally {
      setLoading(null)
    }
  }

  const handleUnlink = async (provider: LinkedProvider) => {
    if (!user) return

    // Don't allow unlinking if it's the only provider
    if (linkedProviders.length <= 1) {
      setError('Cannot unlink your only sign-in method. Please add another method first.')
      setTimeout(() => setError(null), 5000)
      return
    }

    if (!confirm(`Are you sure you want to unlink your ${provider.name} account?`)) {
      return
    }

    setLoading(`unlink-${provider.id}`)
    setError(null)
    setSuccess(null)

    try {
      await unlinkAccount(provider.id as 'google' | 'facebook' | 'apple')
      setSuccess(`${provider.name} account unlinked successfully`)
      setLinkedProviders(linkedProviders.filter(p => p !== provider.id))
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000)
    } catch (err: any) {
      console.error('Unlink account error:', err)
      setError(err.message || `Failed to unlink ${provider.name} account`)
      
      // Clear error after 5 seconds
      setTimeout(() => setError(null), 5000)
    } finally {
      setLoading(null)
    }
  }

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Account Linking</CardTitle>
          <CardDescription>Please sign in to manage your linked accounts</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Linked Accounts</CardTitle>
        <CardDescription>
          Link multiple sign-in methods to your account for easier access
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive" className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-sm">{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="border-green-200 bg-green-50">
            <Check className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-sm text-green-800">{success}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-3">
          {allProviders.map((provider) => {
            const isLinked = linkedProviders.includes(provider.id)
            const isLoading = loading === `link-${provider.id}` || loading === `unlink-${provider.id}`

            return (
              <div
                key={provider.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{provider.icon}</span>
                  <div>
                    <div className="font-medium">{provider.name}</div>
                    <div className="text-sm text-gray-500">
                      {isLinked ? "Linked" : "Not linked"}
                    </div>
                  </div>
                </div>

                {isLinked ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleUnlink(provider)}
                    disabled={isLoading || linkedProviders.length <= 1}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Unlinking...
                      </>
                    ) : (
                      <>
                        <X className="mr-2 h-4 w-4" />
                        Unlink
                      </>
                    )}
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleLink(provider)}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Linking...
                      </>
                    ) : (
                      <>
                        <Check className="mr-2 h-4 w-4" />
                        Link
                      </>
                    )}
                  </Button>
                )}
              </div>
            )
          })}
        </div>

        {linkedProviders.length <= 1 && (
          <Alert className="border-yellow-200 bg-yellow-50">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-sm text-yellow-800">
              You must have at least one linked account. Add another sign-in method before unlinking this one.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}

