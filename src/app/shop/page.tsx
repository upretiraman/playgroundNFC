import type { Metadata } from "next";
import Link from "next/link";
import Container from "@/components/Container";
import ProductArt from "@/components/ProductArt";
import { repository } from "@/lib/repository";

export const metadata: Metadata = {
  title: "Shop",
  description:
    "Official NFC Nürnberg merchandise — caps, tote bags, and more, with every order helping cover pitch time and kit.",
};

export default async function ShopPage() {
  const products = await repository.getProducts();

  return (
    <div className="bg-cream py-16 sm:py-20">
      <Container>
        <div className="mb-12 text-center">
          <span className="font-display text-sm uppercase tracking-[0.3em] text-crimson">
            NFC N&uuml;rnberg
          </span>
          <h1 className="mt-2 font-display text-4xl text-charcoal sm:text-5xl">
            Club Shop
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-charcoal-soft">
            Wear the badge. Every order helps cover pitch time, kit, and
            tournament fees. Online checkout is coming soon — for now, get in
            touch to order.
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <div
              key={product.slug}
              className="flex flex-col overflow-hidden rounded-xl bg-white/60 shadow-sm"
            >
              <ProductArt variant={product.artVariant} />
              <div className="flex flex-1 flex-col p-6">
                <p className="font-display text-xs uppercase tracking-[0.3em] text-crimson">
                  {product.category}
                </p>
                <h2 className="mt-2 font-display text-xl text-charcoal">
                  {product.name}
                </h2>
                <p className="mt-2 flex-1 text-sm text-charcoal-soft">
                  {product.description}
                </p>
                <p className="mt-3 text-xs uppercase tracking-wide text-charcoal-soft">
                  {product.colorway}
                </p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="font-display text-lg text-charcoal">
                    &euro;{product.price}
                  </span>
                  <Link
                    href="/contact"
                    className="rounded bg-crimson px-4 py-2 font-display text-xs uppercase tracking-wide text-cream hover:bg-crimson-light"
                  >
                    Order
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-12 text-center text-sm text-charcoal-soft">
          More designs and sizes are on the way. Have a request?{" "}
          <Link href="/contact" className="text-crimson underline">
            Get in touch
          </Link>
          .
        </p>
      </Container>
    </div>
  );
}
