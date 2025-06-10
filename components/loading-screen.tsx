"use client"

import { useEffect, useState } from "react"
import { Loader2, Heart, Users, Globe } from "lucide-react"

interface LoadingScreenProps {
  message?: string
  type?: "default" | "donation" | "campaign" | "payment"
}

export function LoadingScreen({ message = "Loading...", type = "default" }: LoadingScreenProps) {
  const [dots, setDots] = useState("")
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const dotsInterval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."))
    }, 500)

    const progressInterval = setInterval(() => {
      setProgress((prev) => (prev >= 100 ? 0 : prev + 1))
    }, 50)

    return () => {
      clearInterval(dotsInterval)
      clearInterval(progressInterval)
    }
  }, [])

  const getLoadingIcon = () => {
    switch (type) {
      case "donation":
        return <Heart className="w-8 h-8 text-emerald-600 animate-pulse" />
      case "campaign":
        return <Users className="w-8 h-8 text-blue-600 animate-pulse" />
      case "payment":
        return <Globe className="w-8 h-8 text-purple-600 animate-pulse" />
      default:
        return <Loader2 className="w-8 h-8 text-gray-600 animate-spin" />
    }
  }

  const getGradientColors = () => {
    switch (type) {
      case "donation":
        return "from-emerald-50 to-green-50"
      case "campaign":
        return "from-blue-50 to-indigo-50"
      case "payment":
        return "from-purple-50 to-pink-50"
      default:
        return "from-gray-50 to-slate-50"
    }
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br ${getGradientColors()} flex items-center justify-center p-4`}>
      <div className="text-center">
        {/* Animated Logo/Icon */}
        <div className="mb-8">
          <div className="relative mx-auto w-24 h-24 bg-white rounded-full shadow-lg flex items-center justify-center animate-loading-bounce">
            {getLoadingIcon()}

            {/* Rotating Ring */}
            <div className="absolute inset-0 border-4 border-transparent border-t-blue-200 rounded-full animate-spin"></div>
            <div className="absolute inset-2 border-4 border-transparent border-t-emerald-200 rounded-full animate-spin-reverse"></div>
          </div>
        </div>

        {/* Loading Text */}
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">
          {message}
          {dots}
        </h2>

        <p className="text-gray-600 mb-8">Please wait while we process your request</p>

        {/* Progress Bar */}
        <div className="w-64 mx-auto mb-6">
          <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-500 to-emerald-500 h-full rounded-full transition-all duration-100 ease-out animate-progress-pulse"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Floating Elements */}
        <div className="relative">
          <div className="absolute -top-4 -left-8 w-3 h-3 bg-blue-300 rounded-full animate-float opacity-60"></div>
          <div className="absolute -top-2 right-4 w-2 h-2 bg-emerald-300 rounded-full animate-float-delayed opacity-60"></div>
          <div className="absolute top-2 -right-6 w-4 h-4 bg-purple-300 rounded-full animate-float opacity-60"></div>
        </div>
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        @keyframes loading-bounce {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        
        @keyframes spin-reverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        
        @keyframes progress-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        
        .animate-loading-bounce { animation: loading-bounce 2s ease-in-out infinite; }
        .animate-spin-reverse { animation: spin-reverse 3s linear infinite; }
        .animate-progress-pulse { animation: progress-pulse 2s ease-in-out infinite; }
        .animate-float { animation: float 3s ease-in-out infinite; }
        .animate-float-delayed { animation: float-delayed 4s ease-in-out infinite; }
      `}</style>
    </div>
  )
}
