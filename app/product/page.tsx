import type { Metadata } from "next";
import Product from "~/components/product";

export const metadata: Metadata = {
  title: "M&P Growth Assistant — Never Miss a Lead. Book More Jobs.",
};

export default function ProductPage() {
  return <Product />;
}
