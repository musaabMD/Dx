import { auth } from "@clerk/nextjs/server";
import { DashboardHeader } from "@/components/site-header";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  await auth.protect();

  return (
    <>
      <DashboardHeader />
      {children}
    </>
  );
}
