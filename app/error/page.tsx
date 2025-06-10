import type { Metadata } from "next"
import { GenericErrorPage } from "@/components/generic-error-page"

export const metadata: Metadata = {
  title: "Something Went Wrong - FundRaise",
  description: "An unexpected error occurred",
}

export default function ErrorPage() {
  return <GenericErrorPage />
}
