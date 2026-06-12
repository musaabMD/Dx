import Link from "next/link";
import { Plus } from "lucide-react";

import { AppIcon } from "@/components/app-icon";
import { products } from "@/lib/products";

export function DashboardInstalledApps() {
  const workspaceProducts = products.slice(0, 12);

  return (
    <div className="flex flex-col gap-8">
      {workspaceProducts.length > 0 ? (
        <div className="grid grid-cols-1 gap-x-2 gap-y-1 sm:grid-cols-2 lg:grid-cols-3">
          {workspaceProducts.map((product) => (
            <Link
              key={product.slug}
              href={`/product/${product.slug}`}
              className="group flex items-center gap-3.5 rounded-2xl px-3 py-3 text-left no-underline transition-all duration-200 hover:-translate-y-0.5 hover:bg-zinc-50 hover:shadow-md hover:shadow-zinc-200/60"
            >
              <AppIcon product={product} />
              <div className="min-w-0">
                <p className="font-semibold leading-tight text-zinc-900">{product.name}</p>
                <p className="mt-0.5 truncate text-sm text-zinc-500">{product.sub}</p>
              </div>
            </Link>
          ))}
        </div>
      ) : null}
      <Link
        href="/#products"
        className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-zinc-300 bg-white px-4 text-base font-semibold text-zinc-900 no-underline transition-colors hover:bg-zinc-50"
      >
        <Plus className="size-4" />
        Add new
      </Link>
    </div>
  );
}
