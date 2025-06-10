"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { DollarSign, Users, Globe, Heart } from "lucide-react"

export function ImpactStats() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 },
    )

    const element = document.getElementById("impact-stats")
    if (element) {
      observer.observe(element)
    }

    return () => observer.disconnect()
  }, [])

  const stats = [
    {
      icon: DollarSign,
      value: "15.2B",
      label: "Total raised",
      prefix: "$",
      color: "text-emerald-600",
      bgColor: "bg-emerald-100",
    },
    {
      icon: Users,
      value: "50M",
      label: "People helped",
      prefix: "",
      suffix: "+",
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      icon: Globe,
      value: "195",
      label: "Countries reached",
      prefix: "",
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      icon: Heart,
      value: "2.1M",
      label: "Campaigns funded",
      prefix: "",
      color: "text-pink-600",
      bgColor: "bg-pink-100",
    },
  ]

  const AnimatedNumber = ({ value, prefix = "", suffix = "" }: { value: string; prefix?: string; suffix?: string }) => {
    const [displayValue, setDisplayValue] = useState("0")

    useEffect(() => {
      if (!isVisible) return

      const numericValue = Number.parseFloat(value.replace(/[^\d.]/g, ""))
      const unit = value.replace(/[\d.]/g, "")

      let current = 0
      const increment = numericValue / 50
      const timer = setInterval(() => {
        current += increment
        if (current >= numericValue) {
          setDisplayValue(value)
          clearInterval(timer)
        } else {
          setDisplayValue(current.toFixed(1) + unit)
        }
      }, 30)

      return () => clearInterval(timer)
    }, [isVisible, value])

    return (
      <span>
        {prefix}
        {displayValue}
        {suffix}
      </span>
    )
  }

  return (
    <section id="impact-stats" className="py-24 bg-gradient-to-r from-emerald-600 to-blue-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Our Global Impact</h2>
          <p className="text-xl text-emerald-100 max-w-3xl mx-auto">
            Together, we've created positive change across the world. Here's the impact we've made so far.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <Card
              key={index}
              className="border-0 shadow-xl bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all duration-300"
            >
              <CardContent className="p-8 text-center">
                <div className={`w-16 h-16 ${stat.bgColor} rounded-2xl flex items-center justify-center mx-auto mb-6`}>
                  <stat.icon className={`w-8 h-8 ${stat.color}`} />
                </div>
                <div className="text-4xl md:text-5xl font-bold text-white mb-2">
                  <AnimatedNumber value={stat.value} prefix={stat.prefix} suffix={stat.suffix} />
                </div>
                <p className="text-emerald-100 font-medium">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
