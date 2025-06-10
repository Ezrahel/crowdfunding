"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Mail, CheckCircle } from "lucide-react"

export function Newsletter() {
  const [email, setEmail] = useState("")
  const [isSubscribed, setIsSubscribed] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Simulate subscription
    setIsSubscribed(true)
    setEmail("")
  }

  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="max-w-4xl mx-auto border-0 shadow-xl">
          <CardContent className="p-8 md:p-12 text-center">
            <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Mail className="w-8 h-8 text-emerald-600" />
            </div>

            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Stay Updated</h2>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Get inspiring stories, fundraising tips, and platform updates delivered to your inbox. Join our community
              newsletter.
            </p>

            {!isSubscribed ? (
              <form onSubmit={handleSubmit} className="max-w-md mx-auto">
                <div className="flex gap-4">
                  <Input
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="flex-1 h-12"
                  />
                  <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 h-12 px-6">
                    Subscribe
                  </Button>
                </div>
                <p className="text-sm text-gray-500 mt-4">We respect your privacy. Unsubscribe at any time.</p>
              </form>
            ) : (
              <div className="max-w-md mx-auto">
                <div className="flex items-center justify-center space-x-2 text-emerald-600 mb-4">
                  <CheckCircle className="w-6 h-6" />
                  <span className="font-semibold">Successfully subscribed!</span>
                </div>
                <p className="text-gray-600">
                  Thank you for joining our community. You'll receive our next newsletter soon.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
