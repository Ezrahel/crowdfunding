"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star, Quote } from "lucide-react"

export function Testimonials() {
  const [currentTestimonial, setCurrentTestimonial] = useState(0)

  const testimonials = [
    {
      name: "Emily Rodriguez",
      role: "Campaign Organizer",
      avatar: "/placeholder.svg?height=60&width=60",
      content:
        "This platform made it incredibly easy to raise funds for my daughter's medical treatment. The support from the community was overwhelming and heartwarming.",
      rating: 5,
      amount: "$45,000 raised",
    },
    {
      name: "Michael Chen",
      role: "Donor & Supporter",
      avatar: "/placeholder.svg?height=60&width=60",
      content:
        "I love being able to support causes that matter to me. The transparency and updates from campaign organizers make me feel confident in my donations.",
      rating: 5,
      amount: "Donated to 12 campaigns",
    },
    {
      name: "Dr. Sarah Williams",
      role: "Non-profit Director",
      avatar: "/placeholder.svg?height=60&width=60",
      content:
        "Our organization has successfully funded multiple community projects through this platform. It's user-friendly and reaches a wide audience of potential supporters.",
      rating: 5,
      amount: "$120,000 raised",
    },
    {
      name: "James Thompson",
      role: "Small Business Owner",
      avatar: "/placeholder.svg?height=60&width=60",
      content:
        "After a fire destroyed my restaurant, this platform helped me rebuild. The process was straightforward, and the support was incredible.",
      rating: 5,
      amount: "$78,000 raised",
    },
  ]

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [testimonials.length])

  return (
    <section className="py-24 bg-gradient-to-r from-blue-600 to-purple-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">What Our Community Says</h2>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto">
            Join thousands of satisfied users who have successfully raised funds and supported causes they care about.
          </p>
        </div>

        <div className="relative max-w-4xl mx-auto">
          <Card className="border-0 shadow-2xl bg-white/10 backdrop-blur-sm">
            <CardContent className="p-8 md:p-12">
              <div className="text-center">
                <Quote className="w-12 h-12 text-white/60 mx-auto mb-6" />

                <blockquote className="text-xl md:text-2xl text-white font-medium leading-relaxed mb-8">
                  "{testimonials[currentTestimonial].content}"
                </blockquote>

                <div className="flex items-center justify-center space-x-4 mb-6">
                  <Avatar className="w-16 h-16 border-4 border-white/20">
                    <AvatarImage src={testimonials[currentTestimonial].avatar || "/placeholder.svg"} />
                    <AvatarFallback>
                      {testimonials[currentTestimonial].name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-left">
                    <div className="text-white font-semibold text-lg">{testimonials[currentTestimonial].name}</div>
                    <div className="text-blue-100">{testimonials[currentTestimonial].role}</div>
                    <div className="text-blue-200 text-sm">{testimonials[currentTestimonial].amount}</div>
                  </div>
                </div>

                <div className="flex justify-center space-x-1 mb-6">
                  {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Testimonial Indicators */}
          <div className="flex justify-center space-x-2 mt-8">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentTestimonial(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentTestimonial ? "bg-white" : "bg-white/40"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
