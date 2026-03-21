"use client"

import { useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FaGoogle } from "react-icons/fa"
import { Mail } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

export default function AccountLinking() {
  const { user } = useAuth()

  const providers = useMemo(() => {
    if (!user) return []
    return user.providerData.map((provider) => {
      if (provider.providerId === 'google.com') {
        return { id: 'google', name: 'Google', icon: <FaGoogle /> }
      }
      if (provider.providerId === 'password') {
        return { id: 'email', name: 'Email & Password', icon: <Mail className="h-4 w-4" /> }
      }
      return { id: provider.providerId, name: provider.providerId, icon: <Mail className="h-4 w-4" /> }
    })
  }, [user])

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Sign-In Methods</CardTitle>
          <CardDescription>Please sign in to view the methods linked to your account.</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sign-In Methods</CardTitle>
        <CardDescription>This project supports Firebase Authentication with email/password and Google only.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {providers.map((provider) => (
          <div key={provider.id} className="flex items-center justify-between rounded-lg border p-4">
            <div className="flex items-center gap-3">
              <span className="text-lg">{provider.icon}</span>
              <span className="font-medium">{provider.name}</span>
            </div>
            <Badge variant="secondary">Linked</Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
