import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="mt-16 bg-neutral-950 text-white">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        {/* Top */}
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link to="/" className="text-2xl font-bold tracking-tight">
              ZANCART
            </Link>

            <p className="mt-4 max-w-sm text-sm leading-6 text-neutral-400">
              Discover products you'll love across fashion, technology, home,
              and everyday essentials.
            </p>

            {/* Social */}

            <div className="mt-6 flex gap-3">
              <a
                href="#"
                aria-label="Instagram"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-800 text-sm font-medium transition hover:bg-white hover:text-black"
              >
                IG
              </a>

              <a
                href="#"
                aria-label="Facebook"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-800 text-sm font-medium transition hover:bg-white hover:text-black"
              >
                FB
              </a>

              <a
                href="#"
                aria-label="Twitter"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-800 text-sm font-medium transition hover:bg-white hover:text-black"
              >
                X
              </a>

              <a
                href="#"
                aria-label="YouTube"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-800 text-sm font-medium transition hover:bg-white hover:text-black"
              >
                YT
              </a>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h3 className="text-sm font-semibold">Shop</h3>

            <ul className="mt-5 space-y-3 text-sm text-neutral-400">
              <li>
                <Link
                  to="/product-list"
                  className="transition hover:text-white"
                >
                  All Products
                </Link>
              </li>

              <li>
                <Link
                  to="/product-list?category=Fashion"
                  className="transition hover:text-white"
                >
                  Fashion
                </Link>
              </li>

              <li>
                <Link
                  to="/product-list?category=Electronics"
                  className="transition hover:text-white"
                >
                  Electronics
                </Link>
              </li>

              <li>
                <Link
                  to="/product-list?category=Home"
                  className="transition hover:text-white"
                >
                  Home
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer */}
          <div>
            <h3 className="text-sm font-semibold">Customer Care</h3>

            <ul className="mt-5 space-y-3 text-sm text-neutral-400">
              <li>
                <Link to="#" className="transition hover:text-white">
                  Contact Us
                </Link>
              </li>

              <li>
                <Link to="#" className="transition hover:text-white">
                  Shipping & Delivery
                </Link>
              </li>

              <li>
                <Link to="#" className="transition hover:text-white">
                  Returns & Refunds
                </Link>
              </li>

              <li>
                <Link to="#" className="transition hover:text-white">
                  FAQs
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-sm font-semibold">Company</h3>

            <ul className="mt-5 space-y-3 text-sm text-neutral-400">
              <li>
                <Link to="#" className="transition hover:text-white">
                  About ZANCART
                </Link>
              </li>

              <li>
                <Link to="#" className="transition hover:text-white">
                  Privacy Policy
                </Link>
              </li>

              <li>
                <Link to="#" className="transition hover:text-white">
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Newsletter */}
        <div className="mt-14 border-t border-neutral-800 pt-10">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
            <div>
              <h3 className="text-lg font-semibold">Stay in the loop</h3>

              <p className="mt-2 text-sm text-neutral-400">
                Get updates about new products and exclusive deals.
              </p>
            </div>

            <form
              onSubmit={(e) => e.preventDefault()}
              className="flex w-full max-w-md gap-2"
            >
              <input
                type="email"
                placeholder="Your email address"
                className="min-w-0 flex-1 rounded-full border border-neutral-800 bg-neutral-900 px-5 py-3 text-sm text-white outline-none placeholder:text-neutral-500 focus:border-neutral-500"
              />

              <button
                type="submit"
                className="rounded-full bg-white px-5 py-3 text-sm font-medium text-black transition hover:bg-neutral-200"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-10 flex flex-col gap-3 border-t border-neutral-800 pt-6 text-xs text-neutral-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 ZANCART. All rights reserved.</p>

          <p>Made with React & Tailwind CSS</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
