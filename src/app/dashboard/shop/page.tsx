import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import Container from "@/components/Container";
import DeleteProductButton from "@/components/dashboard/DeleteProductButton";
import { getSessionUser } from "@/lib/auth-helpers";
import { db } from "@/lib/db";

export const metadata: Metadata = {
  title: "Manage Shop",
};

export default async function DashboardShopPage() {
  const user = await getSessionUser();
  if (!user) return null;
  if (user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const products = await db.product.findMany({ orderBy: { createdAt: "asc" } });

  return (
    <div className="bg-cream py-16 sm:py-20">
      <Container>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="font-display text-sm uppercase tracking-[0.3em] text-crimson">
              Administrator
            </span>
            <h1 className="mt-2 font-display text-4xl text-charcoal sm:text-5xl">
              Manage Shop
            </h1>
          </div>
          <Link
            href="/dashboard/shop/new"
            className="rounded bg-crimson px-5 py-2.5 font-display text-sm uppercase tracking-wide text-cream hover:bg-crimson-light"
          >
            Add Product
          </Link>
        </div>

        <div className="mt-10 overflow-x-auto rounded-xl border border-cream-dark bg-white/60 shadow-sm">
          <table className="w-full min-w-[720px] text-left">
            <thead>
              <tr className="border-b border-cream-dark bg-cream-dark/60">
                <th className="p-3 font-display text-xs uppercase tracking-wide text-charcoal-soft">
                  Product
                </th>
                <th className="p-3 font-display text-xs uppercase tracking-wide text-charcoal-soft">
                  Category
                </th>
                <th className="p-3 font-display text-xs uppercase tracking-wide text-charcoal-soft">
                  Price
                </th>
                <th className="p-3 font-display text-xs uppercase tracking-wide text-charcoal-soft">
                  Visible
                </th>
                <th className="p-3" />
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-b border-cream-dark/60">
                  <td className="p-3 text-charcoal">{product.name}</td>
                  <td className="p-3 text-sm text-charcoal-soft">
                    {product.category}
                  </td>
                  <td className="p-3 text-sm text-charcoal-soft">
                    {product.currency} {product.price}
                  </td>
                  <td className="p-3 text-sm text-charcoal-soft">
                    {product.active ? "Yes" : "No"}
                  </td>
                  <td className="p-3 text-right text-sm">
                    <Link
                      href={`/dashboard/shop/${product.id}`}
                      className="font-display uppercase tracking-wide text-crimson hover:text-crimson-dark"
                    >
                      Edit
                    </Link>
                    <span className="mx-2 text-charcoal-soft/40">·</span>
                    <DeleteProductButton
                      productId={product.id}
                      productName={product.name}
                    />
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-charcoal-soft/70">
                    No products yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Container>
    </div>
  );
}
