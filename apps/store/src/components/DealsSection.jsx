import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getActiveDealsWithProducts } from "../services/dealsService";

function DealsSection({ id }) {
  const navigate = useNavigate();

  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDeals = async () => {
      try {
        const activeDeals = await getActiveDealsWithProducts();

        // Show only deals that actually have products.
        const validDeals = activeDeals.filter(
          (deal) => deal.products?.length > 0,
        );

        // Homepage only needs a small preview.
        setDeals(validDeals.slice(0, 2));
      } catch (error) {
        console.error("Failed to load deals:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDeals();
  }, []);

  const handleDeals = () => {
    navigate("/deals");
  };

  const handleProduct = (productId) => {
    navigate(`/products/${productId}`);
  };

  if (!loading && deals.length === 0) {
    return null;
  }

  return (
    <section id={id} className="scroll-mt-24 px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Heading */}
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="mb-2 text-sm font-medium uppercase tracking-[0.2em] text-neutral-500">
              Don't miss out
            </p>

            <h2 className="text-3xl font-semibold tracking-tight text-neutral-900 sm:text-4xl">
              Today’s Deals
            </h2>
          </div>

          <button
            onClick={handleDeals}
            className="hidden text-sm font-medium text-neutral-900 underline underline-offset-4 transition hover:text-neutral-500 sm:block"
          >
            View all deals
          </button>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="grid gap-5 md:grid-cols-2">
            {[1, 2].map((item) => (
              <div
                key={item}
                className="h-[360px] animate-pulse rounded-3xl bg-neutral-100"
              />
            ))}
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2">
            {deals.map((deal) => {
              const previewProducts = deal.products.slice(0, 3);

              return (
                <div
                  key={deal.id}
                  className="overflow-hidden rounded-3xl border border-neutral-200 bg-white"
                >
                  {/* Deal Header */}
                  <div className="p-7 sm:p-8">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <span className="inline-flex rounded-full bg-neutral-900 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white">
                          {getDealLabel(deal)}
                        </span>

                        <h3 className="mt-4 text-2xl font-semibold tracking-tight text-neutral-900 sm:text-3xl">
                          {deal.title}
                        </h3>

                        {deal.description && (
                          <p className="mt-2 max-w-md text-sm leading-6 text-neutral-500">
                            {deal.description}
                          </p>
                        )}
                      </div>

                      <button
                        onClick={handleDeals}
                        className="shrink-0 text-sm font-medium text-neutral-900 underline underline-offset-4"
                      >
                        View deal
                      </button>
                    </div>
                  </div>

                  {/* Products */}
                  <div className="grid grid-cols-3 gap-px bg-neutral-200">
                    {previewProducts.map((product) => (
                      <button
                        key={product.id}
                        onClick={() => handleProduct(product.id)}
                        className="group bg-white text-left"
                      >
                        <div className="aspect-square overflow-hidden bg-neutral-100">
                          <img
                            src={getProductImage(product)}
                            alt={product.title}
                            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                          />
                        </div>

                        <div className="p-3">
                          <p className="truncate text-sm font-medium text-neutral-900">
                            {product.title}
                          </p>

                          <p className="mt-1 text-sm font-semibold text-neutral-900">
                            ₹{product.discountPrice ?? product.price}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Product count */}
                  {deal.products.length > 3 && (
                    <button
                      onClick={handleDeals}
                      className="w-full border-t border-neutral-200 px-5 py-3 text-sm font-medium text-neutral-600 transition hover:bg-neutral-50 hover:text-neutral-900"
                    >
                      View all {deal.products.length} products →
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Mobile button */}
        <button
          onClick={handleDeals}
          className="mt-6 w-full rounded-full border border-neutral-300 py-3 text-sm font-medium transition hover:bg-neutral-50 sm:hidden"
        >
          View all deals
        </button>
      </div>
    </section>
  );
}

/**
 * Display a readable deal type.
 */
function getDealLabel(deal) {
  switch (deal.type) {
    case "flash_sale":
      return "Flash Sale";

    case "bogo":
      return "Buy 1 Get 1";

    case "bundle":
      return "Bundle Deal";

    case "quantity_discount":
      return "Buy More, Save More";

    default:
      return "Special Deal";
  }
}

/**
 * Safely get the first product image.
 */
function getProductImage(product) {
  if (Array.isArray(product.images) && product.images.length > 0) {
    return product.images[0];
  }

  return "https://via.placeholder.com/500x500?text=Product";
}

export default DealsSection;
