import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import ProductCard from "./ProductCard";

function FeaturedProducts({ products }) {
  const featuredProducts = products
    .filter((product) => product.featured)
    .slice(0, 4);

  return (
    <section className="px-4 py-20 sm:px-6 lg:px-7">
      <div className="mx-auto max-w-[1480px]">
        {/* Header */}
        <div className="mb-10 flex items-end justify-between gap-4">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
              Handpicked
            </p>

            <h2 className="text-3xl font-semibold tracking-[-0.03em] sm:text-4xl lg:text-5xl">
              Featured Products
            </h2>

            <p className="mt-3 max-w-lg text-sm leading-6 text-muted-foreground sm:text-base">
              A selection of products worth taking a closer look at.
            </p>
          </div>

          <Link
            to="/products"
            className="hidden items-center gap-2 text-sm font-medium transition-opacity hover:opacity-60 sm:flex"
          >
            View all
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Products */}
        {featuredProducts.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border p-10 text-center text-muted-foreground">
            No featured products available.
          </div>
        )}

        {/* Mobile View All */}
        <Link
          to="/products"
          className="mt-8 flex items-center justify-center gap-2 text-sm font-medium sm:hidden"
        >
          View all products
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}

export default FeaturedProducts;
