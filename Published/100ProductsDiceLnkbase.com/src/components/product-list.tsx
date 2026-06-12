"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";

import { AppIcon } from "@/components/app-icon";
import { products } from "@/lib/products";

export function ProductList() {
  const [query, setQuery] = useState("");
  const visibleProducts = useMemo(() => {
    const value = query.trim().toLowerCase();

    if (!value) {
      return products;
    }

    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(value) ||
        product.sub.toLowerCase().includes(value) ||
        product.tagline.toLowerCase().includes(value),
    );
  }, [query]);

  return (
    <div className="flex flex-col gap-10">
      <div className="relative mx-auto w-full">
        <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search products"
          className="h-11 w-full rounded-full bg-zinc-100 pl-11 pr-4 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none transition-colors focus:bg-white focus:ring-2 focus:ring-zinc-900"
        />
      </div>

      {visibleProducts.length === 0 ? (
        <div className="py-20 text-center">
          <p className="font-medium text-zinc-900">No products match &quot;{query}&quot;</p>
          <p className="mt-1 text-sm text-zinc-500">Try a different name or clear the search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-x-2 gap-y-1 sm:grid-cols-2 lg:grid-cols-4">
          {visibleProducts.map((product) => (
            <Link
              key={product.slug}
              href={`/product/${product.slug}`}
              className="group flex items-center gap-3.5 rounded-2xl px-3 py-3 text-left no-underline transition-all duration-200 hover:-translate-y-0.5 hover:bg-zinc-50 hover:shadow-md hover:shadow-zinc-200/60"
            >
              <AppIcon
                product={product}
                className="transition-transform duration-200 group-hover:scale-105"
              />
              <div className="min-w-0">
                <p className="font-semibold leading-tight text-zinc-900">{product.name}</p>
                <p className="mt-0.5 truncate text-sm text-zinc-500">{product.sub}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
