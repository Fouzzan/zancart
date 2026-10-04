import {
  ArrowRight,
  Clock3,
  Gift,
  Package,
  Percent,
  Sparkles,
  Tag,
  TicketPercent,
  Zap,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import api from "../services/api";
import { getActiveDealsWithProducts } from "../services/dealsService";

const PRODUCTS_PER_DEAL = 4;

function Deals() {
  const navigate = useNavigate();

  const [deals, setDeals] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDealsData = async () => {
      try {
        const [activeDeals, couponsResponse] = await Promise.all([
          getActiveDealsWithProducts(),
          api.get("/coupons"),
        ]);

        // Only display deals that actually contain products.
        const validDeals = activeDeals.filter(
          (deal) => deal.products?.length > 0,
        );

        setDeals(validDeals);
        setCoupons(couponsResponse.data);
      } catch (error) {
        console.error("Failed to load deals:", error);
        toast.error("Failed to load deals.");
      } finally {
        setLoading(false);
      }
    };

    fetchDealsData();
  }, []);

  const activeCoupons = useMemo(() => {
    const now = new Date();

    return coupons.filter((coupon) => {
      if (!coupon.isActive) {
        return false;
      }

      if (!coupon.expiryDate) {
        return true;
      }

      return new Date(coupon.expiryDate) >= now;
    });
  }, [coupons]);

  const scrollToDeals = () => {
    document.getElementById("active-deals")?.scrollIntoView({
      behavior: "smooth",
    });
  };

  const scrollToCoupons = () => {
    document.getElementById("coupons")?.scrollIntoView({
      behavior: "smooth",
    });
  };

  return (
    <main className="min-h-screen bg-white text-neutral-950">
      {/* =====================================================
          HERO
      ===================================================== */}
      <section className="px-4 pb-8 pt-8 sm:px-6 lg:px-8 lg:pt-12">
        <div className="mx-auto max-w-7xl">
          <div className="relative overflow-hidden rounded-[2rem] bg-neutral-950 px-6 py-16 text-white sm:px-10 lg:px-16 lg:py-24">
            <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-white/10 blur-3xl" />

            <div className="absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-white/5 blur-3xl" />

            <div className="absolute right-16 top-16 hidden opacity-10 lg:block">
              <Percent className="h-44 w-44" />
            </div>

            <div className="relative max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-medium uppercase tracking-[0.18em] text-white/75">
                <Sparkles className="h-4 w-4" />
                ZanCart Deals
              </div>

              <h1 className="mt-6 text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
                Deals worth
                <br />
                coming back for.
              </h1>

              <p className="mt-6 max-w-2xl text-base leading-7 text-white/60 sm:text-lg">
                Discover limited-time promotions, special offers, creative deals
                and exclusive savings available on ZanCart.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={scrollToDeals}
                  className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-medium text-neutral-950 transition hover:bg-neutral-200"
                >
                  Explore deals
                  <ArrowRight className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  onClick={scrollToCoupons}
                  className="inline-flex items-center gap-2 rounded-full border border-white/20 px-6 py-3 text-sm font-medium text-white transition hover:bg-white/10"
                >
                  View coupons
                  <TicketPercent className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          DEAL TYPES
      ===================================================== */}
      <section className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">
              More ways to save
            </p>

            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              Not every deal is just a discount.
            </h2>

            <p className="mt-4 text-sm leading-6 text-neutral-500">
              ZanCart supports different types of promotions so customers can
              save in more creative ways.
            </p>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <DealTypeCard
              icon={<Zap className="h-5 w-5" />}
              title="Flash Deals"
              description="Limited-time savings on selected products."
            />

            <DealTypeCard
              icon={<Gift className="h-5 w-5" />}
              title="Buy 1 Get 1"
              description="Buy a qualifying product and receive another qualifying item free."
            />

            <DealTypeCard
              icon={<Package className="h-5 w-5" />}
              title="Bundle Offers"
              description="Combine selected products and unlock a special bundle price."
            />

            <DealTypeCard
              icon={<Percent className="h-5 w-5" />}
              title="Buy More, Save More"
              description="Unlock bigger savings when you purchase more qualifying items."
            />
          </div>
        </div>
      </section>

      {/* =====================================================
          ACTIVE DEALS
      ===================================================== */}
      <section
        id="active-deals"
        className="scroll-mt-24 bg-neutral-50 px-4 py-16 sm:px-6 lg:px-8"
      >
        <div className="mx-auto max-w-7xl">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">
              Active promotions
            </p>

            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              Shop the deals
            </h2>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-500">
              Every product shown below belongs to the promotion above it.
              Choose a product to see its full details.
            </p>
          </div>

          <div className="mt-10">
            {loading ? (
              <div className="space-y-8">
                <DealSectionSkeleton />
                <DealSectionSkeleton />
              </div>
            ) : deals.length === 0 ? (
              <EmptyDeals />
            ) : (
              <div className="space-y-10">
                {deals.map((deal) => (
                  <DealProductSection
                    key={deal.id}
                    deal={deal}
                    onProductClick={(productId) =>
                      navigate(`/products/${productId}`)
                    }
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* =====================================================
          COUPONS
      ===================================================== */}
      <section id="coupons" className="scroll-mt-24 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">
              Extra savings
            </p>

            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              Active Coupons
            </h2>

            <p className="mt-3 text-sm leading-6 text-neutral-500">
              Use an eligible coupon during checkout to save even more.
            </p>
          </div>

          <div className="mt-8">
            {loading ? (
              <div className="grid gap-4 md:grid-cols-2">
                {[1, 2].map((item) => (
                  <div
                    key={item}
                    className="h-32 animate-pulse rounded-3xl bg-neutral-100"
                  />
                ))}
              </div>
            ) : activeCoupons.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-neutral-300 p-10 text-center">
                <TicketPercent className="mx-auto h-7 w-7 text-neutral-400" />

                <p className="mt-3 text-sm text-neutral-500">
                  No active coupons are available right now.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {activeCoupons.map((coupon) => (
                  <CouponCard key={coupon.id} coupon={coupon} />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* =====================================================
          FINAL CTA
      ===================================================== */}
      <section className="px-4 pb-16 pt-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-neutral-100 px-6 py-14 text-center sm:px-10">
          <Sparkles className="mx-auto h-7 w-7" />

          <h2 className="mt-5 text-3xl font-semibold tracking-tight">
            Don't miss the next one.
          </h2>

          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-neutral-500">
            Explore the full ZanCart collection and find something worth adding
            to your cart.
          </p>

          <button
            type="button"
            onClick={() => navigate("/products")}
            className="mt-7 inline-flex items-center gap-2 rounded-full bg-neutral-950 px-6 py-3 text-sm font-medium text-white transition hover:bg-neutral-800"
          >
            Start shopping
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </section>
    </main>
  );
}

/* =========================================================
   DEAL TYPE CARD
========================================================= */

function DealTypeCard({ icon, title, description }) {
  return (
    <div className="rounded-3xl border border-neutral-200 bg-white p-6 transition hover:-translate-y-1 hover:shadow-lg">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-neutral-950 text-white">
        {icon}
      </div>

      <h3 className="mt-5 text-lg font-semibold">{title}</h3>

      <p className="mt-2 text-sm leading-6 text-neutral-500">{description}</p>
    </div>
  );
}

/* =========================================================
   DEAL + PRODUCTS SECTION
========================================================= */

function DealProductSection({ deal, onProductClick }) {
  const [currentPage, setCurrentPage] = useState(1);

  const products = deal.products || [];

  const totalPages = Math.ceil(products.length / PRODUCTS_PER_DEAL);

  const visibleProducts = products.slice(
    (currentPage - 1) * PRODUCTS_PER_DEAL,
    currentPage * PRODUCTS_PER_DEAL,
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [deal.id]);

  return (
    <article className="overflow-hidden rounded-[2rem] border border-neutral-200 bg-white">
      {/* Deal information */}
      <div className="p-6 sm:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full bg-neutral-950 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-white">
                {getDealIcon(deal.type)}
                {getDealLabel(deal.type)}
              </span>

              <span className="rounded-full bg-neutral-100 px-3 py-1.5 text-xs font-medium text-neutral-600">
                {products.length}{" "}
                {products.length === 1 ? "product" : "products"}
              </span>
            </div>

            <h3 className="mt-5 text-2xl font-semibold tracking-tight text-neutral-950 sm:text-3xl">
              {deal.title}
            </h3>

            {deal.description && (
              <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-500">
                {deal.description}
              </p>
            )}
          </div>

          <div className="flex shrink-0 flex-wrap gap-2">
            {deal.endDate && (
              <div className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-neutral-50 px-4 py-2 text-xs text-neutral-600">
                <Clock3 className="h-3.5 w-3.5" />
                Ends {formatDate(deal.endDate)}
              </div>
            )}
          </div>
        </div>

        {/* Deal-specific information */}
        <DealOfferSummary deal={deal} />
      </div>

      {/* Products */}
      <div className="border-t border-neutral-200">
        <div className="grid grid-cols-2 gap-px bg-neutral-200 sm:grid-cols-3 lg:grid-cols-4">
          {visibleProducts.map((product) => (
            <DealProductCard
              key={product.id}
              product={product}
              onClick={() => onProductClick(product.id)}
            />
          ))}
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-neutral-200 px-5 py-4 sm:px-6">
          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
            className="rounded-full border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50 disabled:pointer-events-none disabled:opacity-40"
          >
            Previous
          </button>

          <span className="text-sm text-neutral-500">
            Page {currentPage} of {totalPages}
          </span>

          <button
            type="button"
            disabled={currentPage === totalPages}
            onClick={() =>
              setCurrentPage((page) => Math.min(totalPages, page + 1))
            }
            className="rounded-full border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50 disabled:pointer-events-none disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </article>
  );
}

/* =========================================================
   DEAL PRODUCT CARD
========================================================= */

function DealProductCard({ product, onClick }) {
  const image = getProductImage(product);

  const hasDiscountPrice =
    product.discountPrice !== undefined &&
    product.discountPrice !== null &&
    Number(product.discountPrice) < Number(product.price);

  return (
    <button
      type="button"
      onClick={onClick}
      className="group bg-white text-left transition hover:bg-neutral-50"
    >
      <div className="relative aspect-square overflow-hidden bg-neutral-100">
        <img
          src={image}
          alt={product.title}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />

        <span className="absolute left-3 top-3 rounded-full bg-neutral-950 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white">
          Deal
        </span>
      </div>

      <div className="p-4">
        <h4 className="line-clamp-2 text-sm font-medium text-neutral-900">
          {product.title}
        </h4>

        <div className="mt-2 flex flex-wrap items-center gap-2">
          {hasDiscountPrice ? (
            <>
              <span className="text-sm font-semibold text-neutral-950">
                ₹{product.discountPrice}
              </span>

              <span className="text-xs text-neutral-400 line-through">
                ₹{product.price}
              </span>
            </>
          ) : (
            <span className="text-sm font-semibold text-neutral-950">
              ₹{product.price}
            </span>
          )}
        </div>

        <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-neutral-600">
          View product
          <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-1" />
        </span>
      </div>
    </button>
  );
}

/* =========================================================
   DEAL OFFER SUMMARY
========================================================= */

function DealOfferSummary({ deal }) {
  switch (deal.type) {
    case "bogo":
      return (
        <div className="mt-6 inline-flex items-center gap-3 rounded-2xl bg-neutral-50 px-4 py-3">
          <Gift className="h-5 w-5 text-neutral-700" />

          <div>
            <p className="text-sm font-semibold text-neutral-900">
              Buy {deal.buyQuantity ?? 1} Get {deal.getQuantity ?? 1}
            </p>

            <p className="mt-0.5 text-xs text-neutral-500">
              Available on selected products
            </p>
          </div>
        </div>
      );

    case "bundle":
      return (
        <div className="mt-6 inline-flex items-center gap-3 rounded-2xl bg-neutral-50 px-4 py-3">
          <Package className="h-5 w-5 text-neutral-700" />

          <div>
            <p className="text-sm font-semibold text-neutral-900">
              Bundle price{" "}
              {deal.bundlePrice !== undefined ? `₹${deal.bundlePrice}` : ""}
            </p>

            <p className="mt-0.5 text-xs text-neutral-500">
              Combine selected products
            </p>
          </div>
        </div>
      );

    case "quantity_discount":
      return (
        <div className="mt-6 inline-flex items-center gap-3 rounded-2xl bg-neutral-50 px-4 py-3">
          <Percent className="h-5 w-5 text-neutral-700" />

          <div>
            <p className="text-sm font-semibold text-neutral-900">
              Buy more, save more
            </p>

            <p className="mt-0.5 text-xs text-neutral-500">
              Bigger quantities unlock bigger savings
            </p>
          </div>
        </div>
      );

    case "flash_sale":
    default:
      return (
        <div className="mt-6 inline-flex items-center gap-3 rounded-2xl bg-neutral-50 px-4 py-3">
          <Zap className="h-5 w-5 text-neutral-700" />

          <div>
            <p className="text-sm font-semibold text-neutral-900">
              {getDiscountText(deal)}
            </p>

            <p className="mt-0.5 text-xs text-neutral-500">
              Limited-time offer
            </p>
          </div>
        </div>
      );
  }
}

/* =========================================================
   COUPON CARD
========================================================= */

function CouponCard({ coupon }) {
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(coupon.code);

      toast.success(`Copied ${coupon.code}`);
    } catch (error) {
      console.error("Failed to copy coupon:", error);
      toast.error("Unable to copy coupon.");
    }
  };

  return (
    <div className="flex flex-col justify-between gap-5 rounded-3xl border border-neutral-200 bg-white p-6 sm:flex-row sm:items-center">
      <div>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-950 text-white">
            <Tag className="h-4 w-4" />
          </div>

          <span className="font-mono text-lg font-semibold">{coupon.code}</span>
        </div>

        <p className="mt-3 text-sm text-neutral-600">
          {coupon.discountType === "percentage"
            ? `${coupon.discountValue}% off`
            : `₹${coupon.discountValue} off`}

          {coupon.minimumOrderAmount
            ? ` on orders above ₹${coupon.minimumOrderAmount}`
            : ""}
        </p>

        {coupon.expiryDate && (
          <p className="mt-1 text-xs text-neutral-500">
            Valid until {formatDate(coupon.expiryDate)}
          </p>
        )}
      </div>

      <button
        type="button"
        onClick={handleCopy}
        className="rounded-full bg-neutral-950 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-neutral-800"
      >
        Copy code
      </button>
    </div>
  );
}

/* =========================================================
   LOADING
========================================================= */

function DealSectionSkeleton() {
  return (
    <div className="overflow-hidden rounded-[2rem] border border-neutral-200 bg-white">
      <div className="space-y-4 p-6 sm:p-8">
        <div className="h-5 w-28 animate-pulse rounded bg-neutral-100" />
        <div className="h-8 w-72 animate-pulse rounded bg-neutral-100" />
        <div className="h-4 w-full max-w-xl animate-pulse rounded bg-neutral-100" />
      </div>

      <div className="grid grid-cols-2 gap-px bg-neutral-200 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="bg-white">
            <div className="aspect-square animate-pulse bg-neutral-100" />

            <div className="space-y-2 p-4">
              <div className="h-4 animate-pulse rounded bg-neutral-100" />
              <div className="h-4 w-20 animate-pulse rounded bg-neutral-100" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* =========================================================
   EMPTY STATE
========================================================= */

function EmptyDeals() {
  return (
    <div className="rounded-[2rem] border border-dashed border-neutral-300 bg-white p-14 text-center">
      <Tag className="mx-auto h-9 w-9 text-neutral-400" />

      <h3 className="mt-4 text-xl font-medium">No active deals right now</h3>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-neutral-500">
        There aren't any active promotions at the moment. Check back soon for
        new offers.
      </p>
    </div>
  );
}

/* =========================================================
   HELPERS
========================================================= */

function getDealIcon(type) {
  switch (type) {
    case "bogo":
      return <Gift className="h-4 w-4" />;

    case "bundle":
      return <Package className="h-4 w-4" />;

    case "quantity_discount":
      return <Percent className="h-4 w-4" />;

    case "flash_sale":
    default:
      return <Zap className="h-4 w-4" />;
  }
}

function getDealLabel(type) {
  switch (type) {
    case "bogo":
      return "Buy 1 Get 1";

    case "bundle":
      return "Bundle Offer";

    case "quantity_discount":
      return "Buy More Save More";

    case "flash_sale":
    default:
      return "Flash Sale";
  }
}

function getDiscountText(deal) {
  if (deal.discountType === "percentage") {
    return `${deal.discountValue}% OFF`;
  }

  if (deal.discountType === "fixed") {
    return `₹${deal.discountValue} OFF`;
  }

  return "Special offer";
}

function getProductImage(product) {
  if (Array.isArray(product.images) && product.images.length > 0) {
    return product.images[0];
  }

  if (typeof product.images === "string" && product.images) {
    return product.images;
  }

  return "https://via.placeholder.com/500x500?text=Product";
}

function formatDate(date) {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default Deals;
