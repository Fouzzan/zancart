import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Show, UserButton } from "@clerk/react";
import { Heart, Menu, Search, ShoppingCart, X } from "lucide-react";
import { useState } from "react";
import { useSelector } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";

function Navbar() {
  const items = useSelector((state) => state.cart.items);
  const navigate = useNavigate();
  const location = useLocation();
  const cartCount = items.reduce((total, item) => total + item.quantity, 0);
  const wishListCount = useSelector((state) => state.wishlist.items).length;
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [search, setSearch] = useState();
  const handleCategorySelect = (category) => {
    const params = new URLSearchParams(location.search);

    params.set("category", category);

    navigate(`/products?${params.toString()}`);
  };
  return (
    <header className="sticky top-0 z-50  ">
      <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
        <nav className="flex h-14 items-center justify-between rounded-full border border-white/40 bg-white/30 px-4 shadow-lg sm:px-6 backdrop-blur-md">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-1 text-xl font-semibold tracking-tight text-[#1D1D1F]"
          >
            {/* <ShoppingBag className="h-8 w-8"/> */}

            <span>Z A N C A R T</span>
          </Link>

          <button
            type="button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="rounded-full p-2.5 transition hover:bg-gray-100 md:hidden"
          >
            {isMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>

          {/* Desktop Navigation */}
          <div className="hidden items-center gap-7 md:flex">
            <Link
              to="/"
              className="text-sm font-medium text-gray-700  hover:text-black transition-transform duration-300 ease-in-out hover:scale-110"
            >
              Home
            </Link>

            <Link
              to="/products"
              className="text-sm font-medium text-gray-700 hover:text-black transition-transform duration-300 ease-in-out hover:scale-110"
            >
              Shop
            </Link>

            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <button
                    type="button"
                    className="
          text-sm font-medium
          text-gray-700
          transition-
          hover:text-black
           duration-300 ease-in-out hover:scale-110
        "
                  />
                }
              >
                Categories
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="center"
                className="w-48 border-white/30 bg-white/40 shadow-lg backdrop-blur-md "
              >
                <DropdownMenuItem
                  onClick={() => handleCategorySelect("Fashion")}
                  className="transition-all duration-300 ease-in-out hover:scale-105 hover:font-semibold"
                >
                  Fashion
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => handleCategorySelect("Electronics")}
                  className="transition-all duration-300 ease-in-out hover:scale-105 hover:font-semibold"
                >
                  Electronics
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => handleCategorySelect("Home")}
                  className="transition-all duration-300 ease-in-out hover:scale-105 hover:font-semibold"
                >
                  Home
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => handleCategorySelect("Stationery")}
                  className="transition-all duration-300 ease-in-out hover:scale-105 hover:font-semibold"
                >
                  Stationery
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => handleCategorySelect("Fitness")}
                  className="transition-all duration-300 ease-in-out hover:scale-105 hover:font-semibold"
                >
                  Fitness
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Link
              to="/products"
              className="text-sm font-medium text-gray-700 hover:text-black transition-transform duration-300 ease-in-out hover:scale-110"
            >
              Deals
            </Link>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            {/* Search */}
            <form
              onSubmit={(e) => {
                e.preventDefault();

                const query = search.trim();

                if (!query) return;

                const params = new URLSearchParams(location.search);

                params.set("search", query);

                navigate(`/products?${params.toString()}`);

                setSearch("");
              }}
              className="
    group
    flex h-10
    w-10
    items-center
    rounded-full
    border border-transparent
    bg-transparent
    transition-all duration-500
    hover:w-56
    hover:border-gray-300
    hover:bg-white
    focus-within:w-56
    focus-within:border-gray-300
    focus-within:bg-white
  "
            >
              {/* Search Icon */}
              <button
                type="submit"
                aria-label="Search"
                className="
      flex h-10 w-10
      shrink-0
      items-center justify-center
      rounded-full
      transition-colors
      hover:bg-gray-100
    "
              >
                <Search className="h-5 w-5 text-[#1D1D1F]" />
              </button>

              {/* Search Input */}
              <Input
                type="search"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="
      h-10
      min-w-0
      flex-1
      border-0
      bg-transparent
      px-0
      opacity-0
      transition-all duration-300

      group-hover:px-3
      group-focus-within:px-3

      group-hover:opacity-100
      group-focus-within:opacity-100

      focus-visible:ring-0
      focus-visible:ring-offset-0
    "
              />
            </form>

            {/* Wishlist */}
            <Link
              to="/wishlist"
              className="relative rounded-full p-2.5 hover:bg-gray-100/30 transition-transform duration-300 ease-in-out hover:scale-115"
            >
              <Heart className="h-5 w-5" />

              {wishListCount > 0 && (
                <span className="absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-medium text-white">
                  {wishListCount}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link
              to="/cart"
              className="relative rounded-full p-2.5  hover:bg-gray-100/30 transition-transform duration-300 ease-in-out hover:scale-110"
            >
              <ShoppingCart className="h-5 w-5" />

              {cartCount > 0 && (
                <span className="absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-black px-1 text-[10px] font-medium text-white">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* User */}
            {/* <button
              className="rounded-full p-2.5 transition hover:bg-gray-100"
              aria-label="Account"
            >
              <User className="h-5 w-5" />
            </button> */}
            <Show when="signed-in">
              <UserButton className="w-5 h-5" />
            </Show>
            <Show when="signed-out">
              <Link
                to="/login"
                className="rounded-full bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
              >
                Sign In
              </Link>
            </Show>
          </div>
        </nav>

        {isMenuOpen && (
          <div className="mt-2 rounded-2xl border border-black/5 bg-white p-4 shadow-sm md:hidden">
            <div className="flex flex-col gap-1">
              <Link
                to="/"
                onClick={() => setIsMenuOpen(false)}
                className="rounded-xl px-4 py-3 text-sm font-medium hover:bg-gray-100"
              >
                Home
              </Link>

              <Link
                to="/products"
                onClick={() => setIsMenuOpen(false)}
                className="rounded-xl px-4 py-3 text-sm font-medium hover:bg-gray-100"
              >
                Shop
              </Link>

              <Link
                to="/products"
                onClick={() => setIsMenuOpen(false)}
                className="rounded-xl px-4 py-3 text-sm font-medium hover:bg-gray-100"
              >
                Categories
              </Link>

              <Link
                to="/products"
                onClick={() => setIsMenuOpen(false)}
                className="rounded-xl px-4 py-3 text-sm font-medium hover:bg-gray-100"
              >
                Deals
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

export default Navbar;
