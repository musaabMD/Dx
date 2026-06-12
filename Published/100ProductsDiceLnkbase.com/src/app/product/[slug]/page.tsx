import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { RefreshCw, ShieldCheck, Zap } from "lucide-react";

import { AppIcon } from "@/components/app-icon";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { getProduct, products, type Product } from "@/lib/products";

type ProductPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return products.map((product) => ({
    slug: product.slug,
  }));
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = getProduct(slug);

  if (!product) {
    return {
      title: "Product not found - Lnkbase",
    };
  }

  return {
    title: `${product.name} - Lnkbase`,
    description: product.tagline,
  };
}

function FeatureVisual({ product, variant }: { product: Product; variant: number }) {
  const statusIcons = [
    <Zap key="zap" className="size-4 text-amber-500" />,
    <RefreshCw key="sync" className="size-4 text-sky-500" />,
    <ShieldCheck key="safe" className="size-4 text-emerald-500" />,
  ];

  return (
    <div className="flex items-center justify-center rounded-3xl bg-zinc-50 p-8 sm:p-12">
      <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-sm ring-1 ring-zinc-100">
        <div className="flex items-center gap-3">
          <AppIcon product={product} size="sm" />
          <div className="flex-1">
            <div className="h-2.5 w-24 rounded-full bg-zinc-200" />
            <div className="mt-1.5 h-2 w-16 rounded-full bg-zinc-100" />
          </div>
          {statusIcons[variant]}
        </div>
        <div className="mt-5 flex flex-col gap-3">
          <div className="h-2.5 w-full rounded-full bg-zinc-100" />
          <div className="h-2.5 w-5/6 rounded-full bg-zinc-100" />
          <div className="h-2.5 w-2/3 rounded-full bg-zinc-100" />
        </div>
        <div className="mt-5 flex gap-2">
          <div className={`h-8 w-24 rounded-lg bg-gradient-to-b ${product.tile}`} />
          <div className="h-8 w-20 rounded-lg bg-zinc-100" />
        </div>
      </div>
    </div>
  );
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = getProduct(slug);

  if (!product) {
    notFound();
  }

  const relatedProducts = products.filter((item) => item.slug !== product.slug).slice(0, 6);
  const features = [
    {
      title: `${product.name} works the moment you open it.`,
      body: `No installs, no setup, no waiting. Open Lnkbase ${product.name} in any browser and keep moving from the same account.`,
    },
    {
      title: "Connected to everything Lnkbase.",
      body: `${product.name} shares one account with the rest of Lnkbase, so your work, files, and context stay close without extra setup.`,
    },
    {
      title: "Clean by default.",
      body: `The interface stays quiet and focused. ${product.name} gives you the essentials first and keeps the rest out of the way.`,
    },
  ];

  return (
    <main className="min-h-screen bg-white">
      <SiteHeader />
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-x-0 top-12 hidden h-96 lg:block" aria-hidden="true">
          {relatedProducts.map((item, index) => {
            const positions = [
              "left-[8%] top-8 -rotate-6",
              "left-[15%] top-44 rotate-3",
              "left-[6%] top-72 rotate-6",
              "right-[10%] top-10 rotate-6",
              "right-[6%] top-52 -rotate-3",
              "right-[14%] top-80 -rotate-6",
            ];

            return (
              <div key={item.slug} className={`absolute opacity-60 ${positions[index]}`}>
                <AppIcon product={item} className="shadow-md shadow-zinc-200/70" />
              </div>
            );
          })}
        </div>

        <div className="relative mx-auto max-w-2xl px-6 pb-24 pt-20 text-center sm:pt-24">
          <div className="flex justify-center">
            <AppIcon product={product} size="xl" />
          </div>
          <p className="mt-6 text-base font-semibold text-zinc-900">Lnkbase {product.name}</p>
          <h1 className="mt-4 text-5xl font-bold tracking-tight text-zinc-900 sm:text-6xl">
            {product.tagline}
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-xl leading-8 text-zinc-500">
            {product.description}
          </p>
          <div className="mx-auto mt-10 flex w-full max-w-md justify-center">
            <Button
              size="lg"
              className="h-12 w-full rounded-xl text-base font-semibold"
              render={<Link href="/signup" />}
              nativeButton={false}
            >
              Start using {product.name}
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto flex max-w-6xl flex-col gap-24 px-6 pb-32 sm:gap-32">
        {features.map((feature, index) => (
          <div
            key={feature.title}
            className={`grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16 ${
              index % 2 === 1 ? "lg:[direction:rtl]" : ""
            }`}
          >
            <div className="lg:[direction:ltr]">
              <h2 className="text-3xl font-bold leading-tight tracking-tight text-zinc-900 sm:text-4xl">
                {feature.title}
              </h2>
              <p className="mt-5 text-lg leading-8 text-zinc-500">{feature.body}</p>
            </div>
            <div className="lg:[direction:ltr]">
              <FeatureVisual product={product} variant={index} />
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}
