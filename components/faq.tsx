"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp, HelpCircle } from "lucide-react"
import Link from "next/link"

export function FAQ() {
  const [openItems, setOpenItems] = useState<number[]>([0])

  const faqs = [
    {
      question: "How much does it cost to start a fundraiser?",
      answer:
        "Starting a fundraiser is completely free. We only charge a small platform fee (2.9% + $0.30) when you receive donations. There are no upfront costs, monthly fees, or hidden charges.",
    },
    {
      question: "How long does it take to receive funds?",
      answer:
        "Funds are typically available for withdrawal 2-5 business days after a donation is made. The exact timing depends on your bank and the payment method used by the donor.",
    },
    {
      question: "Can I edit my campaign after it's published?",
      answer:
        "Yes, you can edit most aspects of your campaign including the story, photos, and goal amount. Some changes may require verification to ensure transparency for your donors.",
    },
    {
      question: "What payment methods do you accept?",
      answer:
        "We accept all major credit cards, debit cards, PayPal, Apple Pay, and Google Pay. Donors can choose their preferred payment method during checkout.",
    },
    {
      question: "Is my personal information secure?",
      answer:
        "Absolutely. We use bank-level encryption and security measures to protect your personal and financial information. We're PCI DSS compliant and regularly audited for security.",
    },
    {
      question: "Can I fundraise for someone else?",
      answer:
        "Yes, you can create a fundraiser on behalf of someone else. You'll need to provide information about your relationship to the beneficiary and may need additional verification.",
    },
    {
      question: "What happens if I don't reach my goal?",
      answer:
        "You keep all the money you raise, even if you don't reach your goal. There's no penalty for not reaching your target amount, and you can extend your campaign if needed.",
    },
    {
      question: "How do I promote my fundraiser?",
      answer:
        "Share your campaign on social media, email it to friends and family, and use our built-in sharing tools. We also provide tips and resources to help you effectively promote your fundraiser.",
    },
  ]

  const toggleItem = (index: number) => {
    setOpenItems((prev) => (prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]))
  }

  return (
    <section className="py-24 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <HelpCircle className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
          <p className="text-xl text-gray-600">Get answers to common questions about fundraising on our platform.</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <Card key={index} className="border border-gray-200 hover:shadow-md transition-shadow duration-200">
              <CardContent className="p-0">
                <Button
                  variant="ghost"
                  onClick={() => toggleItem(index)}
                  className="w-full p-6 text-left justify-between hover:bg-gray-50 rounded-lg"
                >
                  <span className="font-semibold text-gray-900 pr-4">{faq.question}</span>
                  {openItems.includes(index) ? (
                    <ChevronUp className="w-5 h-5 text-gray-500 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />
                  )}
                </Button>
                {openItems.includes(index) && (
                  <div className="px-6 pb-6">
                    <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">Still have questions?</p>
          <Button variant="outline" size="lg" className="border-2">
            <Link href={"/contact"}>
            Contact Support
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
