import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  Heart,
  LogOut,
  MapPin,
  Menu,
  Package,
  Search,
  ShoppingCart,
  UserRound,
  X,
} from "lucide-react";
import { useState } from "react";
import { useSelector } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext";
import MobileBottomNav from "./MobileBottomNav";

function Navbar() {
  const { user, isAuthenticated, logout } = useAuthContext();
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  const items = useSelector((state) => state.cart.items);
  const wishlistItems = useSelector((state) => state.wishlist.items);

  const navigate = useNavigate();
  const location = useLocation();

  const cartCount = Array.isArray(items)
    ? items.reduce((total, item) => total + (Number(item.quantity) || 0), 0)
    : 0;

  const wishListCount = Array.isArray(wishlistItems) ? wishlistItems.length : 0;

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [search, setSearch] = useState("");

  const handleCategorySelect = (category) => {
    const params = new URLSearchParams(location.search);
    params.set("category", category);
    navigate(`/products?${params.toString()}`);
    setIsMenuOpen(false);
  };

  const handleSearch = (event) => {
    event.preventDefault();

    const query = search.trim();
    if (!query) return;

    const params = new URLSearchParams(location.search);
    params.set("search", query);

    navigate(`/products?${params.toString()}`);
    setSearch("");
    setIsMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
    navigate("/login", { replace: true });
  };

  const closeMobileMenu = () => setIsMenuOpen(false);

  const categories = [
    "Fashion",
    "Electronics",
    "Home",
    "Stationery",
    "Fitness",
  ];

  return (
    <>
      <header className="sticky top-0 z-50">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <nav className="relative flex h-14 items-center justify-between rounded-full border border-white/40 bg-white/30 px-4 shadow-lg backdrop-blur-md sm:px-6">
            {/* Logo */}
            {/* Mobile header: normal and expanded search states */}
            <div className="relative flex w-full items-center justify-between md:hidden">
              {isMobileSearchOpen ? (
                <>
                  <button
                    type="button"
                    aria-label="Close search"
                    onClick={() => {
                      setIsMobileSearchOpen(false);
                      setSearch("");
                    }}
                    className="shrink-0 rounded-full p-2 transition hover:bg-black/5"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </button>

                  <form
                    onSubmit={handleSearch}
                    className="ml-2 flex h-10 min-w-0 flex-1 items-center rounded-full border border-black/10 bg-white/70 px-3 focus-within:border-black/30"
                  >
                    <Search className="mr-2 h-4 w-4 shrink-0 text-gray-500" />

                    <Input
                      type="text"
                      autoFocus
                      placeholder="Search products..."
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      className="h-full min-w-0 flex-1 border-0 bg-transparent px-0 text-sm shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
                    />

                    {search && (
                      <button
                        type="button"
                        aria-label="Clear search"
                        onClick={() => setSearch("")}
                        className="ml-2 shrink-0 rounded-full p-1 text-gray-500 hover:text-black"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </form>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    aria-label={isMenuOpen ? "Close menu" : "Open menu"}
                    aria-expanded={isMenuOpen}
                    onClick={() => setIsMenuOpen((open) => !open)}
                    className="relative z-10 rounded-full p-2.5 transition hover:bg-gray-100"
                  >
                    {isMenuOpen ? (
                      <X className="h-5 w-5" />
                    ) : (
                      <Menu className="h-5 w-5" />
                    )}
                  </button>

                  <Link
                    to="/"
                    onClick={closeMobileMenu}
                    className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap text-xl font-semibold tracking-tight text-[#1D1D1F]"
                  >
                    Z A N C A R T
                  </Link>

                  <button
                    type="button"
                    aria-label="Open search"
                    onClick={() => {
                      setIsMenuOpen(false);
                      setIsMobileSearchOpen(true);
                    }}
                    className="relative z-10 rounded-full p-2.5 transition hover:bg-gray-100"
                  >
                    <Search className="h-5 w-5" />
                  </button>
                </>
              )}
            </div>

            {/* Desktop logo */}
            <Link
              to="/"
              onClick={closeMobileMenu}
              className="hidden items-center gap-1 text-xl font-semibold tracking-tight text-[#1D1D1F] md:flex"
            >
              <span>Z A N C A R T</span>
            </Link>

            {/* Desktop navigation — centered */}
            <div className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-7 md:flex">
              <Link
                to="/"
                className="text-sm font-medium text-gray-700 transition-transform duration-300 ease-in-out hover:scale-110 hover:text-black"
              >
                Home
              </Link>

              <Link
                to="/products"
                className="text-sm font-medium text-gray-700 transition-transform duration-300 ease-in-out hover:scale-110 hover:text-black"
              >
                Shop
              </Link>

              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <button
                      type="button"
                      className="text-sm font-medium text-gray-700 transition duration-300 ease-in-out hover:scale-110 hover:text-black"
                    />
                  }
                >
                  Categories
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  align="center"
                  className="w-48 border-white/30 bg-white/90 shadow-lg backdrop-blur-md"
                >
                  {categories.map((category) => (
                    <DropdownMenuItem
                      key={category}
                      onClick={() => handleCategorySelect(category)}
                      className="transition-all duration-300 ease-in-out hover:scale-105 hover:font-semibold"
                    >
                      {category}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <Link
                to="/deals"
                className="text-sm font-medium text-gray-700 transition-transform duration-300 ease-in-out hover:scale-110 hover:text-black"
              >
                Deals
              </Link>
            </div>

            {/* Right-side actions */}
            <div className="hidden md:flex items-center gap-1">
              {/* Search */}
              <form
                onSubmit={handleSearch}
                className="group flex h-10 w-10 items-center rounded-full border border-transparent bg-transparent transition-all duration-500 hover:w-56 hover:border-gray-300 hover:bg-white focus-within:w-56 focus-within:border-gray-300 focus-within:bg-white"
              >
                <button
                  type="submit"
                  aria-label="Search products"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-gray-100"
                >
                  <Search className="h-5 w-5 text-[#1D1D1F]" />
                </button>

                <Input
                  type="search"
                  placeholder="Search products..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  className="h-10 min-w-0 flex-1 border-0 bg-transparent px-0 opacity-0 transition-all duration-300 group-hover:px-3 group-focus-within:px-3 group-hover:opacity-100 group-focus-within:opacity-100 focus-visible:ring-0 focus-visible:ring-offset-0"
                />
              </form>

              {/* Wishlist */}
              <Link
                to="/wishlist"
                aria-label={`Wishlist${wishListCount ? `, ${wishListCount} items` : ""}`}
                className="relative rounded-full p-2.5 transition-transform duration-300 ease-in-out hover:scale-110 hover:bg-gray-100/30"
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
                aria-label={`Shopping cart${cartCount ? `, ${cartCount} items` : ""}`}
                className="relative rounded-full p-2.5 transition-transform duration-300 ease-in-out hover:scale-110 hover:bg-gray-100/30"
              >
                <ShoppingCart className="h-5 w-5" />

                {cartCount > 0 && (
                  <span className="absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-black px-1 text-[10px] font-medium text-white">
                    {cartCount}
                  </span>
                )}
              </Link>

              {/* Desktop account menu */}
              {isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <button
                        type="button"
                        aria-label="Account menu"
                        className="flex max-w-40 items-center gap-2 rounded-full p-2 transition hover:bg-gray-100"
                      />
                    }
                  >
                    <UserRound className="h-5 w-5 shrink-0" />
                    <span className="hidden truncate text-sm sm:inline">
                      {user?.name || "Account"}
                    </span>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent align="end" className="w-52">
                    <DropdownMenuItem onClick={() => navigate("/profile")}>
                      <UserRound className="mr-2 h-4 w-4" />
                      My Profile
                    </DropdownMenuItem>

                    <DropdownMenuItem onClick={() => navigate("/orders")}>
                      <Package className="mr-2 h-4 w-4" />
                      My Orders
                    </DropdownMenuItem>

                    <DropdownMenuItem onClick={() => navigate("/addresses")}>
                      <MapPin className="mr-2 h-4 w-4" />
                      Addresses
                    </DropdownMenuItem>

                    <DropdownMenuItem onClick={() => navigate("/wishlist")}>
                      <Heart className="mr-2 h-4 w-4" />
                      Wishlist
                    </DropdownMenuItem>

                    <DropdownMenuItem onClick={() => navigate("/cart")}>
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      My Cart
                    </DropdownMenuItem>

                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link
                  to="/login"
                  className="rounded-full bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
                >
                  Sign In
                </Link>
              )}
            </div>
          </nav>

          {/* Mobile navigation */}
          {isMenuOpen && (
            <div className="mt-2 max-h-[calc(100dvh-12rem)] overflow-y-auto rounded-2xl border border-black/5 bg-white p-4 shadow-sm md:hidden">
              <div className="flex flex-col gap-1">
                <Link
                  to="/"
                  onClick={closeMobileMenu}
                  className="rounded-xl px-4 py-3 text-sm font-medium hover:bg-gray-100"
                >
                  Home
                </Link>

                <Link
                  to="/products"
                  onClick={closeMobileMenu}
                  className="rounded-xl px-4 py-3 text-sm font-medium hover:bg-gray-100"
                >
                  Shop
                </Link>

                <p className="px-4 pb-1 pt-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Categories
                </p>

                {categories.map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => handleCategorySelect(category)}
                    className="rounded-xl px-4 py-3 text-left text-sm font-medium hover:bg-gray-100"
                  >
                    {category}
                  </button>
                ))}

                <Link
                  to="/deals"
                  onClick={closeMobileMenu}
                  className="rounded-xl px-4 py-3 text-sm font-medium hover:bg-gray-100"
                >
                  Deals
                </Link>

                {isAuthenticated ? (
                  <>
                    <div className="my-2 border-t border-gray-100" />

                    <p className="px-4 py-2 text-sm text-gray-500">
                      Signed in as {user?.name || user?.email || "User"}
                    </p>

                    <Link
                      to="/profile"
                      onClick={closeMobileMenu}
                      className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium hover:bg-gray-100"
                    >
                      <UserRound className="h-4 w-4" />
                      My Profile
                    </Link>

                    <Link
                      to="/orders"
                      onClick={closeMobileMenu}
                      className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium hover:bg-gray-100"
                    >
                      <Package className="h-4 w-4" />
                      My Orders
                    </Link>

                    <Link
                      to="/addresses"
                      onClick={closeMobileMenu}
                      className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium hover:bg-gray-100"
                    >
                      <MapPin className="h-4 w-4" />
                      Addresses
                    </Link>

                    <Link
                      to="/wishlist"
                      onClick={closeMobileMenu}
                      className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium hover:bg-gray-100"
                    >
                      <Heart className="h-4 w-4" />
                      Wishlist
                    </Link>

                    <Link
                      to="/cart"
                      onClick={closeMobileMenu}
                      className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium hover:bg-gray-100"
                    >
                      <ShoppingCart className="h-4 w-4" />
                      My Cart
                    </Link>

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign out
                    </button>
                  </>
                ) : (
                  <Link
                    to="/login"
                    onClick={closeMobileMenu}
                    className="mt-2 rounded-xl bg-black px-4 py-3 text-center text-sm font-medium text-white hover:bg-gray-800"
                  >
                    Sign In
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      <MobileBottomNav />
    </>
  );
}

export default Navbar;
