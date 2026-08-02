import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import Container from "@/components/Container";
import ProductForm from "@/components/dashboard/ProductForm";
import { getSessionUser } from "@/lib/auth-helpers";

export const metadata: Metadata = {
  title: "Add Product",
};

export default async function NewProductPage() {
  const user = await getSessionUser();
  if (!user) return null;
  if (user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  return (
    <div className="bg-cream py-16 sm:py-20">
      <Container className="max-w-2xl">
        <Link
          href="/dashboard/shop"
          className="font-display text-sm uppercase tracking-wide text-crimson hover:text-crimson-dark"
        >
          &larr; Manage Shop
        </Link>
        <h1 className="mt-2 font-display text-4xl text-charcoal sm:text-5xl">
          Add Product
        </h1>

        <div className="mt-8 rounded-xl border border-cream-dark bg-white/60 p-6 shadow-sm">
          <ProductForm />
        </div>
      </Container>
    </div>
  );
}
