import { useNavigate } from "react-router-dom";

function DealsSection() {
  const navigate = useNavigate();

  const handleCategory = (category) => {
    navigate(`/products?category=${encodeURIComponent(category)}`);
  };

  const handleDeals = () => {
    navigate("/product-list?deals=true");
  };

  return (
    <section className="px-4 py-16 sm:px-6 lg:px-8">
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
            className="hidden text-sm font-medium text-neutral-900 underline underline-offset-4 sm:block"
          >
            View all deals
          </button>
        </div>

        {/* Deals */}
        <div className="grid gap-5 md:grid-cols-2">
          {/* Fashion */}
          <div className="group relative min-h-[360px] overflow-hidden rounded-3xl bg-[#e8e2d8]">
            <div className="absolute inset-0">
              <img
                src="https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=1200&auto=format&fit=crop"
                alt="Fashion collection"
                className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
              />

              <div className="absolute inset-0 bg-black/25" />
            </div>

            <div className="relative z-10 flex h-full flex-col justify-between p-7 text-white sm:p-9">
              <div>
                <span className="inline-flex rounded-full bg-white/90 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-neutral-900">
                  Up to 40% off
                </span>
              </div>

              <div>
                <h3 className="max-w-sm text-3xl font-semibold tracking-tight sm:text-4xl">
                  Refresh your wardrobe.
                </h3>

                <p className="mt-3 max-w-sm text-sm leading-6 text-white/85">
                  Discover everyday styles made for your next look.
                </p>

                <button
                  onClick={() => handleCategory("Fashion")}
                  className="mt-6 rounded-full bg-white px-5 py-3 text-sm font-medium text-neutral-900 transition hover:bg-neutral-100"
                >
                  Shop fashion
                </button>
              </div>
            </div>
          </div>

          {/* Electronics */}
          <div className="group relative min-h-[360px] overflow-hidden rounded-3xl bg-[#dfe4e1]">
            <div className="absolute inset-0">
              <img
                src="https://images.unsplash.com/photo-1468495244123-6c6c332eeece?q=80&w=1200&auto=format&fit=crop"
                alt="Technology products"
                className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
              />

              <div className="absolute inset-0 bg-black/30" />
            </div>

            <div className="relative z-10 flex h-full flex-col justify-between p-7 text-white sm:p-9">
              <div>
                <span className="inline-flex rounded-full bg-white/90 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-neutral-900">
                  Tech picks
                </span>
              </div>

              <div>
                <h3 className="max-w-sm text-3xl font-semibold tracking-tight sm:text-4xl">
                  Upgrade your everyday.
                </h3>

                <p className="mt-3 max-w-sm text-sm leading-6 text-white/85">
                  Smart gadgets and essentials at prices worth checking out.
                </p>

                <button
                  onClick={() => handleCategory("Electronics")}
                  className="mt-6 rounded-full bg-white px-5 py-3 text-sm font-medium text-neutral-900 transition hover:bg-neutral-100"
                >
                  Shop electronics
                </button>
              </div>
            </div>
          </div>
        </div>

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

export default DealsSection;
