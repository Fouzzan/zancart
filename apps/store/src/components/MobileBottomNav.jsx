import { Heart, House, ShoppingCart, UserRound } from "lucide-react";
import { useSelector } from "react-redux";
import { Link, useLocation } from "react-router-dom";

const navItems = [
  { label: "Home", path: "/", Icon: House },
  { label: "Wishlist", path: "/wishlist", Icon: Heart },
  { label: "Cart", path: "/cart", Icon: ShoppingCart },
  { label: "Account", path: "/profile", Icon: UserRound },
];

export default function MobileBottomNav() {
  const location = useLocation();

  const items = useSelector((state) => state.cart.items);
  const wishlistItems = useSelector((state) => state.wishlist.items);

  const cartCount = Array.isArray(items)
    ? items.reduce((total, item) => total + (Number(item.quantity) || 0), 0)
    : 0;

  const wishlistCount = Array.isArray(wishlistItems) ? wishlistItems.length : 0;

  return (
    <nav
      aria-label="Mobile navigation"
      className="fixed inset-x-0 bottom-0 z-[60] px-4 pt-3 md:hidden"
      style={{
        paddingBottom: "max(12px, env(safe-area-inset-bottom))",
      }}
    >
      <div className="relative mx-auto flex h-[68px] max-w-[420px] items-center justify-around overflow-hidden rounded-full border border-white/70 bg-white/15 px-2 shadow-[0_8px_32px_rgba(0,0,0,0.18),inset_0_1px_1px_rgba(255,255,255,0.8),inset_0_-1px_1px_rgba(255,255,255,0.2)] backdrop-blur-2xl backdrop-saturate-200">
        {/* Main glass reflection */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-b from-white/55 via-white/10 to-white/5"
        />

        {/* Thin reflective edge */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-5 top-[1px] h-px rounded-full bg-gradient-to-r from-transparent via-white/90 to-transparent"
        />

        {/* Navigation items */}
        {navItems.map(({ label, path, Icon }) => {
          const active =
            path === "/"
              ? location.pathname === "/"
              : location.pathname === path ||
                location.pathname.startsWith(`${path}/`);

          const count =
            label === "Cart"
              ? cartCount
              : label === "Wishlist"
                ? wishlistCount
                : 0;

          return (
            <Link
              key={label}
              to={path}
              aria-label={label}
              title={label}
              aria-current={active ? "page" : undefined}
              className={`relative z-10 flex h-12 min-w-0 flex-1 items-center justify-center rounded-full transition-all duration-300 ease-out ${
                active ? "text-black" : "text-gray-600 hover:text-black"
              }`}
            >
              <span
                className={`relative flex h-11 w-12 items-center justify-center rounded-full transition-all duration-300 ease-out ${
                  active
                    ? "scale-105 border border-white/80 bg-white/65 shadow-[0_2px_8px_rgba(0,0,0,0.08),inset_0_1px_1px_rgba(255,255,255,0.9)]"
                    : ""
                }`}
              >
                <Icon
                  className="h-[22px] w-[22px] shrink-0"
                  strokeWidth={active ? 2.2 : 1.8}
                />

                {/* Cart and wishlist badges */}
                {count > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold leading-none text-white ring-2 ring-white/70">
                    {count > 99 ? "99+" : count}
                  </span>
                )}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
