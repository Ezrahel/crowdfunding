"use client"

import { usePathname } from "next/navigation"
import { Footer } from "./footer"

const PAGES_WITHOUT_FOOTER = [
  "/auth/login",
  "/auth/signup",
//   "/auth/forgot-password",
//   "/auth/reset-password",
//   "/auth/verify-email",
//   "/auth/two-factor",
//   "/auth/email-not-verified",
]

export function ConditionalFooter() {
  const pathname = usePathname()

  // Hide footer on auth pages
  const shouldHideFooter = PAGES_WITHOUT_FOOTER.some((path) => pathname.startsWith(path))

  if (shouldHideFooter) {
    return null
  }

  return <Footer />
}
