"use client"

import { useMemo } from "react"
import { Check, X } from "lucide-react"

interface PasswordStrengthProps {
  password: string
}

interface Requirement {
  label: string
  test: (password: string) => boolean
}

const requirements: Requirement[] = [
  { label: "At least 8 characters", test: (p) => p.length >= 8 },
  { label: "Contains uppercase letter", test: (p) => /[A-Z]/.test(p) },
  { label: "Contains lowercase letter", test: (p) => /[a-z]/.test(p) },
  { label: "Contains number", test: (p) => /\d/.test(p) },
  { label: "Contains special character", test: (p) => /[!@#$%^&*(),.?":{}|<>]/.test(p) },
]

export default function PasswordStrength({ password }: PasswordStrengthProps) {
  const strength = useMemo(() => {
    if (!password) return { score: 0, label: "", color: "" }

    const passedRequirements = requirements.filter((req) => req.test(password)).length

    if (passedRequirements <= 2) {
      return { score: passedRequirements, label: "Weak", color: "bg-red-500" }
    } else if (passedRequirements <= 3) {
      return { score: passedRequirements, label: "Fair", color: "bg-yellow-500" }
    } else if (passedRequirements <= 4) {
      return { score: passedRequirements, label: "Good", color: "bg-blue-500" }
    } else {
      return { score: passedRequirements, label: "Strong", color: "bg-emerald-500" }
    }
  }, [password])

  if (!password) return null

  return (
    <div className="space-y-3">
      {/* Strength Meter */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Password strength</span>
          <span
            className={`font-medium ${
              strength.label === "Weak"
                ? "text-red-600"
                : strength.label === "Fair"
                  ? "text-yellow-600"
                  : strength.label === "Good"
                    ? "text-blue-600"
                    : "text-emerald-600"
            }`}
          >
            {strength.label}
          </span>
        </div>
        <div className="flex space-x-1">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className={`h-2 flex-1 rounded-full transition-colors ${
                i < strength.score ? strength.color : "bg-gray-200 dark:bg-gray-700"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Requirements Checklist */}
      <div className="space-y-1">
        {requirements.map((requirement, index) => {
          const passed = requirement.test(password)
          return (
            <div key={index} className="flex items-center space-x-2 text-sm">
              {passed ? <Check className="w-4 h-4 text-emerald-500" /> : <X className="w-4 h-4 text-gray-400" />}
              <span className={passed ? "text-emerald-600 dark:text-emerald-400" : "text-gray-500 dark:text-gray-400"}>
                {requirement.label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
