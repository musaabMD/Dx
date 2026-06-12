import Link from "next/link";

import { Brand } from "@/components/brand";
import { SiteHeader } from "@/components/site-header";
import { SignupForm } from "@/components/signup-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function SignupPage() {
  return (
    <main className="min-h-screen bg-background">
      <SiteHeader />
      <section className="mx-auto flex max-w-md flex-col gap-8 px-4 py-10 sm:px-6 lg:py-14">
        <div className="flex justify-center">
          <Brand />
        </div>
        <Card className="rounded-lg shadow-none">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Create your Lnkbase account</CardTitle>
            <CardDescription>Add apps and keep them in your dashboard.</CardDescription>
          </CardHeader>
          <CardContent>
            <SignupForm />
            <p className="mt-6 text-center text-sm text-muted-foreground">
              Already signed up?{" "}
              <Link href="/dashboard" className="font-medium text-foreground underline">
                Open dashboard
              </Link>
            </p>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
