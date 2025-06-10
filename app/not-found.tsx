import type { Metadata } from "next"
import { NotFoundPage } from "@/components/not-found-page"

export const metadata: Metadata = {
  title: "Page Not Found - FundRaise",
  description: "The page you're looking for doesn't exist",
}

export default function NotFound() {
  return <NotFoundPage />
}
