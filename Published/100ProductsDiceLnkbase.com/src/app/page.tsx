import { ProductList } from "@/components/product-list";
import { SiteHeader } from "@/components/site-header";

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <SiteHeader />
      <section className="mx-auto max-w-3xl px-6 pb-8 pt-24 text-center sm:pb-10 sm:pt-28">
        <p className="mb-5 text-sm font-semibold tracking-tight text-zinc-500">
          Link OS with AI
        </p>
        <h1 className="text-5xl font-bold tracking-tight text-zinc-900 sm:text-6xl">
          Your AI operating system
          <br />
          for every link.
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-xl leading-8 text-zinc-500">
          Lnkbase turns products, tools, and knowledge into one connected workspace
          you can search, open, and automate.
        </p>
      </section>
      <section id="products" className="mx-auto max-w-4xl px-6 pb-32">
        <div className="sr-only">
          <h2>Products</h2>
        </div>
        <ProductList />
      </section>
    </main>
  );
}
