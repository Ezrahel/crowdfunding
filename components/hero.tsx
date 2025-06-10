"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import Image from "next/image"
import { Search, Play, ArrowRight, Heart, Users } from "lucide-react"

export function Hero() {
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <section className="relative min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[80vh]">
          {/* Left Content */}
          <div className="space-y-8 text-center lg:text-left">
            <div className="space-y-6">
              <div className="inline-flex items-center px-4 py-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 rounded-full text-sm font-medium">
                <Heart className="w-4 h-4 mr-2" />
                Trusted by 50M+ people worldwide
              </div>

              <h1 className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-gray-100 leading-tight">
                Turn your
                <span className="bg-gradient-to-r from-emerald-600 to-blue-600 dark:from-emerald-400 dark:to-blue-400 bg-clip-text text-transparent">
                  {" "}
                  dreams{" "}
                </span>
                into reality
              </h1>

              <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 leading-relaxed max-w-2xl">
                Join the world's largest crowdfunding platform. Start a fundraiser for yourself, a friend, or a cause
                you care about in just minutes.
              </p>
            </div>

            {/* Search Bar */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-2 shadow-xl border border-gray-100 dark:border-gray-700 max-w-lg mx-auto lg:mx-0">
              <div className="flex items-center">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    placeholder="Search campaigns or start your own..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-12 border-0 focus:ring-0 text-lg h-14 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400"
                  />
                </div>
                <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 h-12 px-6 rounded-xl">
                  <Search className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button
                asChild
                size="lg"
                className="bg-emerald-600 hover:bg-emerald-700 text-lg px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Link href="/start">
                  Start a Fundraiser
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="text-lg px-8 py-4 rounded-xl border-2 hover:bg-gray-50"
              >
                <Link href="/explore">
                  <Play className="w-5 h-5 mr-2" />
                  Watch How It Works
                </Link>
              </Button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-gray-200 dark:border-gray-700">
              <div className="text-center lg:text-left">
                <div className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">$15B+</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Raised for causes</div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">50M+</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Donors worldwide</div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">2M+</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Campaigns funded</div>
              </div>
            </div>
          </div>

          {/* Right Content - Hero Image/Video */}
          <div className="relative">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl">
              <Image
                src="https://images.unsplash.com/photo-1674515489647-fd8f76b86f65?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fGNyb3dkZnVuZGluZ3xlbnwwfHwwfHx8MA%3D%3D"
                alt="People supporting each other through crowdfunding"
                width={800}
                height={600}
                className="w-full h-auto"
              />

              {/* Floating Cards */}
              <div className="absolute top-6 left-6 bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg border dark:border-gray-700">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                    <Heart className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-gray-100">$2,500 raised</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">in 24 hours</div>
                  </div>
                </div>
              </div>

              <div className="absolute bottom-6 right-6 bg-white rounded-xl p-4 shadow-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">156 donors</div>
                    <div className="text-sm text-gray-600">and counting</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-yellow-200 rounded-full opacity-60"></div>
            <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-pink-200 rounded-full opacity-40"></div>
          </div>
        </div>
      </div>
    </section>
  )
}
