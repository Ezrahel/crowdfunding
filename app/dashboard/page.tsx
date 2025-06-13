import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { UserDashboard } from "@/components/user-dashboard"

export default async function DashboardPage() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect("/auth/login");
  }

  return <UserDashboard />;
}
