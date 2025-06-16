"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu, X, Heart } from "lucide-react"
import { useAuthModals } from "@/components/auth/auth-modals"
import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs'

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const { openSignup, openLogin } = useAuthModals()

  return (
    <ClerkProvider>

    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Heart className="h-8 w-8 text-emerald-600" />
            <span className="text-2xl font-bold text-gray-900">FundRaise</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-700 hover:text-emerald-600 font-medium">
              Home
            </Link>
            <Link href="/explore" className="text-gray-700 hover:text-emerald-600 font-medium">
              Explore
            </Link>
            <Link href="/start" className="text-gray-700 hover:text-emerald-600 font-medium">
              Start a Fundraiser
            </Link>
           
            <SignedIn>
              <UserButton />
            </SignedIn>
            <SignedOut>
            <Button variant="ghost" onClick={openLogin} className="text-gray-700 hover:text-emerald-600 font-medium">
              Login
            </Button>
            <Button onClick={openSignup} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              Sign Up
            </Button>
            </SignedOut>

          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 space-y-4">
            <Link href="/" className="block text-gray-700 hover:text-emerald-600 font-medium">
              Home
            </Link>
            <Link href="/explore" className="block text-gray-700 hover:text-emerald-600 font-medium">
              Explore
            </Link>
            <Link href="/start" className="block text-gray-700 hover:text-emerald-600 font-medium">
              Start a Fundraiser
            </Link>
            <Button
              variant="ghost"
              onClick={openLogin}
              className="w-full justify-start text-gray-700 hover:text-emerald-600 font-medium"
            >
              Login
            </Button>
            <Button onClick={openSignup} className="w-full bg-emerald-600 hover:bg-emerald-700">
              Sign Up
            </Button>
          </div>
        )}
      </div>
    </nav>
    </ClerkProvider>
  )
}
export default Navigation