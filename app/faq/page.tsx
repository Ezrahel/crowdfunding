"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Search, HelpCircle, MessageCircle } from "lucide-react"

export default function FAQPage() {
  const [searchQuery, setSearchQuery] = useState("")

  const faqCategories = [
    {
      id: "general",
      label: "General",
      questions: [
        {
          question: "What is FundRaise?",
          answer:
            "FundRaise is a crowdfunding platform that helps individuals, groups, and organizations raise money for personal causes, projects, events, and more. Our platform makes it easy to create a fundraiser, share it with your network, and collect donations securely.",
        },
        {
          question: "How much does it cost to use FundRaise?",
          answer:
            "Creating a fundraiser on FundRaise is completely free. We charge a platform fee of 2.9% plus $0.30 per donation to cover payment processing, platform maintenance, and customer support. There are no setup fees or monthly charges.",
        },
        {
          question: "Who can create a fundraiser?",
          answer:
            "Anyone 18 years or older with a valid bank account and email address can create a fundraiser. We support fundraisers from individuals, non-profits, schools, sports teams, and more across 190+ countries.",
        },
        {
          question: "What types of fundraisers are allowed?",
          answer:
            "FundRaise supports a wide range of fundraisers including medical expenses, emergency relief, memorial funds, education costs, community projects, animal rescue, sports teams, and more. We prohibit fundraisers for illegal activities, hate speech, violence, or those that violate our terms of service.",
        },
      ],
    },
    {
      id: "donations",
      label: "Donations",
      questions: [
        {
          question: "How do I donate to a campaign?",
          answer:
            "To donate, simply visit the campaign page and click the 'Donate' button. You can enter your desired donation amount and payment information. We accept all major credit cards, debit cards, PayPal, Apple Pay, and Google Pay.",
        },
        {
          question: "Are donations tax-deductible?",
          answer:
            "Donations to personal fundraisers are generally not tax-deductible. However, donations to verified non-profit organizations on our platform may be tax-deductible. Always check with a tax professional regarding the deductibility of your specific donation.",
        },
        {
          question: "Can I donate anonymously?",
          answer:
            "Yes, you can choose to donate anonymously during the checkout process. Your name will appear as 'Anonymous' on the campaign page, but the campaign organizer will still receive your donation information for their records.",
        },
        {
          question: "Can I get a refund for my donation?",
          answer:
            "In most cases, donations are non-refundable. However, if you believe there was fraud or misrepresentation, please contact our support team within 14 days of your donation, and we'll review your case.",
        },
      ],
    },
    {
      id: "campaigns",
      label: "Campaigns",
      questions: [
        {
          question: "How do I start a fundraiser?",
          answer:
            "To start a fundraiser, click the 'Start Fundraising' button on our homepage. You'll be guided through a simple process to set up your campaign, including adding a title, story, photos, and fundraising goal. The entire process takes just a few minutes.",
        },
        {
          question: "How long can my fundraiser run?",
          answer:
            "You can set your own deadline or choose to run your fundraiser indefinitely. Many campaigns reach their goals within 30-60 days, but you can adjust your timeline based on your specific needs.",
        },
        {
          question: "Can I edit my fundraiser after it's published?",
          answer:
            "Yes, you can edit most aspects of your fundraiser after it's published, including the title, description, photos, and goal amount. However, some changes may require verification to ensure transparency for your donors.",
        },
        {
          question: "What happens if I don't reach my fundraising goal?",
          answer:
            "You keep all the money you raise, even if you don't reach your goal. There's no penalty for not reaching your target amount, and you can extend your campaign or adjust your goal if needed.",
        },
      ],
    },
    {
      id: "withdrawals",
      label: "Withdrawals",
      questions: [
        {
          question: "How do I withdraw the funds I've raised?",
          answer:
            "You can withdraw your funds by setting up a withdrawal method in your dashboard. We support direct bank deposits, PayPal, and other methods depending on your location. Funds are typically available for withdrawal 2-5 business days after a donation is made.",
        },
        {
          question: "Is there a minimum withdrawal amount?",
          answer:
            "The minimum withdrawal amount is $25. This helps reduce processing fees and ensures efficient fund transfers.",
        },
        {
          question: "How long does it take to receive my funds?",
          answer:
            "After requesting a withdrawal, funds typically arrive in your account within 2-5 business days, depending on your bank and location. International transfers may take longer.",
        },
        {
          question: "Are there fees for withdrawing funds?",
          answer:
            "Standard withdrawals to bank accounts in supported countries are free. However, there may be fees for expedited withdrawals, international transfers, or alternative payment methods. These fees will be clearly displayed before you confirm your withdrawal.",
        },
      ],
    },
    {
      id: "security",
      label: "Security",
      questions: [
        {
          question: "Is my personal information secure?",
          answer:
            "Yes, we take security very seriously. We use bank-level encryption and security measures to protect your personal and financial information. We're PCI DSS compliant and regularly audited for security.",
        },
        {
          question: "How does FundRaise verify fundraisers?",
          answer:
            "We use a combination of automated systems and manual reviews to verify fundraisers. This includes identity verification, relationship verification for fundraisers benefiting others, and monitoring for suspicious activity. We also encourage transparency through social connections and updates.",
        },
        {
          question: "What should I do if I suspect fraud?",
          answer:
            "If you suspect a fundraiser is fraudulent, please report it immediately by clicking the 'Report Campaign' button on the campaign page or contacting our support team. We investigate all reports thoroughly.",
        },
        {
          question: "How does FundRaise protect donors?",
          answer:
            "We protect donors through our secure payment processing, fraud detection systems, and our FundRaise Guarantee. If funds aren't delivered to the intended beneficiary or if a campaign is misrepresented, you may be eligible for a refund under certain conditions.",
        },
      ],
    },
  ]

  // Filter questions based on search query
  const filteredFAQs = searchQuery
    ? faqCategories.map((category) => ({
        ...category,
        questions: category.questions.filter(
          (q) =>
            q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
            q.answer.toLowerCase().includes(searchQuery.toLowerCase()),
        ),
      }))
    : faqCategories

  // Count total questions that match the search
  const totalMatchingQuestions = filteredFAQs.reduce((total, category) => total + category.questions.length, 0)

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-emerald-600 to-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">Frequently Asked Questions</h1>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto mb-8">
            Find answers to common questions about fundraising on our platform.
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              placeholder="Search for answers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-14 text-lg bg-white text-gray-900 border-0 shadow-lg"
            />
          </div>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {searchQuery && (
            <div className="mb-8 p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-600">
                Found {totalMatchingQuestions} result{totalMatchingQuestions !== 1 && "s"} for "{searchQuery}"
              </p>
              {totalMatchingQuestions === 0 && (
                <div className="mt-4 flex items-center text-emerald-600">
                  <HelpCircle className="h-5 w-5 mr-2" />
                  <span>
                    Can't find what you're looking for?{" "}
                    <a href="/contact" className="underline font-medium">
                      Contact our support team
                    </a>
                  </span>
                </div>
              )}
            </div>
          )}

          <Tabs defaultValue="general" className="space-y-8">
            <TabsList className="grid grid-cols-5 w-full">
              {faqCategories.map((category) => (
                <TabsTrigger
                  key={category.id}
                  value={category.id}
                  disabled={!filteredFAQs.find((c) => c.id === category.id)?.questions.length}
                >
                  {category.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {filteredFAQs.map((category) => (
              <TabsContent key={category.id} value={category.id} className="space-y-6">
                {category.questions.length > 0 ? (
                  <Accordion type="single" collapsible className="w-full">
                    {category.questions.map((faq, index) => (
                      <AccordionItem key={index} value={`item-${index}`}>
                        <AccordionTrigger className="text-lg font-medium text-left">{faq.question}</AccordionTrigger>
                        <AccordionContent className="text-gray-600 leading-relaxed">{faq.answer}</AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                ) : (
                  <div className="text-center py-12">
                    <HelpCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No matching questions</h3>
                    <p className="text-gray-600">Try adjusting your search terms or browse other categories</p>
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </section>

      {/* Still Have Questions */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Still Have Questions?</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Our support team is ready to help you with any questions or concerns.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
              <a href="/contact">Contact Support</a>
            </Button>
            <Button asChild variant="outline" className="border-2">
              <a href="/help">
                <MessageCircle className="mr-2 h-5 w-5" />
                Live Chat
              </a>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
