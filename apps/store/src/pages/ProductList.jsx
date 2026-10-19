import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button.jsx";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import ProductCard from "../components/ProductCard.jsx";
import ProductCardSkeleton from "../components/ProductCardSkeleton.jsx";
import {
  setError,
  setLoading,
  setProducts,
} from "../redux/slices/productSlice.js";
import api from "../services/api";

function ProductList() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { products, loading, error } = useSelector((state) => state.product);
  const [searchParams] = useSearchParams();

  const searchQuery = searchParams.get("search") || "";
  const categoryQuery = searchParams.get("category") || "";
  const sortQuery = searchParams.get("sort") || "recommended";
  const priceQuery = searchParams.get("price") || "all";
  const ratingQuery = searchParams.get("rating") || "all";

  // Product filtering
  const filteredProducts = products.filter((product) => {
    const search = searchQuery.toLowerCase();
    const category = categoryQuery.toLowerCase();

    const matchesSearch =
      (product.title || "").toLowerCase().includes(search) ||
      (product.description || "").toLowerCase().includes(search) ||
      (product.category || "").toLowerCase().includes(search) ||
      (product.subcategory || "").toLowerCase().includes(search) ||
      (product.brand || "").toLowerCase().includes(search);

    const matchesCategory =
      !category || (product.category || "").toLowerCase() === category;

    return matchesSearch && matchesCategory;
  });

  // Price filtering
  const priceFilteredProducts = filteredProducts.filter((product) => {
    const price = Number(product.discountPrice);

    if (priceQuery === "under-1000") return price < 1000;
    if (priceQuery === "1000-5000") return price >= 1000 && price <= 5000;
    if (priceQuery === "5000-10000") return price > 5000 && price <= 10000;
    if (priceQuery === "above-10000") return price > 10000;

    return true;
  });

  // Rating filtering
  const ratingFilteredProducts = priceFilteredProducts.filter((product) => {
    const rating = Number(product.rating);

    if (ratingQuery === "4") return rating >= 4;
    if (ratingQuery === "3") return rating >= 3;
    if (ratingQuery === "2") return rating >= 2;

    return true;
  });

  // Sorting
  const sortedProducts = [...ratingFilteredProducts].sort((a, b) => {
    const priceA = Number(a.discountPrice);
    const priceB = Number(b.discountPrice);

    if (sortQuery === "price-low") return priceA - priceB;
    if (sortQuery === "price-high") return priceB - priceA;
    if (sortQuery === "rating") return Number(b.rating) - Number(a.rating);

    return 0;
  });

  // Remove a specific filter
  const removeFilter = (filter) => {
    const params = new URLSearchParams(searchParams);
    params.delete(filter);
    navigate(`/products?${params.toString()}`);
  };

  const clearAllFilters = () => {
    navigate("/products");
  };

  const priceLabels = {
    "under-1000": "Under ₹1,000",
    "1000-5000": "₹1,000 – ₹5,000",
    "5000-10000": "₹5,000 – ₹10,000",
    "above-10000": "Above ₹10,000",
  };

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 12;
  const totalPages = Math.ceil(sortedProducts.length / productsPerPage);
  const startIndex = (currentPage - 1) * productsPerPage;

  const paginatedProducts = sortedProducts.slice(
    startIndex,
    startIndex + productsPerPage,
  );

  const searchParamsString = searchParams.toString();

  useEffect(() => {
    setCurrentPage(1);
  }, [searchParamsString]);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        dispatch(setLoading(true));

        const response = await api.get("/products");

        dispatch(setProducts(response.data));
        dispatch(setLoading(false));
      } catch (error) {
        console.error("Failed to fetch products:", error);
        dispatch(setError("Unable to load products. Please try again."));
        dispatch(setLoading(false));
      }
    };

    fetchProducts();
  }, [dispatch]);

  const hasActiveFilters =
    Boolean(searchQuery) ||
    Boolean(categoryQuery) ||
    priceQuery !== "all" ||
    ratingQuery !== "all";

  return (
    <div className="min-w-0 p-3 sm:p-5 md:p-6">
      {/* Heading and sorting/filter controls */}
      <div className="mb-5 flex min-w-0 flex-col gap-4 lg:mb-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Product List
          </h1>

          {searchQuery && (
            <p className="mt-1 break-words text-sm text-muted-foreground">
              Results for "{searchQuery}"
            </p>
          )}

          {categoryQuery && (
            <p className="mt-1 text-sm text-muted-foreground">
              Category: {categoryQuery}
            </p>
          )}
        </div>

        {/* Controls use a two-column layout on smaller screens */}
        <div className="grid w-full min-w-0 grid-cols-2 gap-2 sm:gap-3 lg:w-auto lg:flex lg:flex-wrap lg:justify-end">
          <Select
            value={sortQuery}
            onValueChange={(value) => {
              const params = new URLSearchParams(searchParams);
              params.set("sort", value);
              navigate(`/products?${params.toString()}`);
            }}
          >
            <SelectTrigger className="h-10 w-full min-w-0 text-xs sm:text-sm lg:w-44">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="recommended">Recommended</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
              <SelectItem value="rating">Rating</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={priceQuery}
            onValueChange={(value) => {
              const params = new URLSearchParams(searchParams);

              if (value === "all") {
                params.delete("price");
              } else {
                params.set("price", value);
              }

              navigate(`/products?${params.toString()}`);
            }}
          >
            <SelectTrigger className="h-10 w-full min-w-0 text-xs sm:text-sm lg:w-44">
              <SelectValue placeholder="Price" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="all">All Prices</SelectItem>
              <SelectItem value="under-1000">Under ₹1,000</SelectItem>
              <SelectItem value="1000-5000">₹1,000 – ₹5,000</SelectItem>
              <SelectItem value="5000-10000">₹5,000 – ₹10,000</SelectItem>
              <SelectItem value="above-10000">Above ₹10,000</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={ratingQuery}
            onValueChange={(value) => {
              const params = new URLSearchParams(searchParams);

              if (value === "all") {
                params.delete("rating");
              } else {
                params.set("rating", value);
              }

              navigate(`/products?${params.toString()}`);
            }}
          >
            <SelectTrigger className="col-span-2 h-10 w-full min-w-0 text-xs sm:text-sm lg:col-span-1 lg:w-44">
              <SelectValue placeholder="Rating" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="all">All Ratings</SelectItem>
              <SelectItem value="4">4★ & above</SelectItem>
              <SelectItem value="3">3★ & above</SelectItem>
              <SelectItem value="2">2★ & above</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Active filter badges */}
      {hasActiveFilters && (
        <div className="mb-5 flex min-w-0 flex-wrap items-center gap-2">
          {searchQuery && (
            <Badge variant="secondary" className="max-w-full gap-1">
              <span className="max-w-40 truncate sm:max-w-60">
                Search: {searchQuery}
              </span>
              <button
                type="button"
                aria-label="Remove search filter"
                onClick={() => removeFilter("search")}
                className="ml-1 shrink-0"
              >
                ×
              </button>
            </Badge>
          )}

          {categoryQuery && (
            <Badge variant="secondary" className="max-w-full gap-1">
              <span className="max-w-32 truncate">{categoryQuery}</span>
              <button
                type="button"
                aria-label="Remove category filter"
                onClick={() => removeFilter("category")}
                className="ml-1 shrink-0"
              >
                ×
              </button>
            </Badge>
          )}

          {priceQuery !== "all" && (
            <Badge variant="secondary" className="gap-1">
              <span>{priceLabels[priceQuery]}</span>
              <button
                type="button"
                aria-label="Remove price filter"
                onClick={() => removeFilter("price")}
                className="ml-1 shrink-0"
              >
                ×
              </button>
            </Badge>
          )}

          {ratingQuery !== "all" && (
            <Badge variant="secondary" className="gap-1">
              <span>{ratingQuery}★ & above</span>
              <button
                type="button"
                aria-label="Remove rating filter"
                onClick={() => removeFilter("rating")}
                className="ml-1 shrink-0"
              >
                ×
              </button>
            </Badge>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="h-8 shrink-0 px-2 text-xs sm:text-sm"
          >
            Clear all
          </Button>
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="grid min-w-0 grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <ProductCardSkeleton key={index} />
          ))}
        </div>
      ) : error ? (
        <div className="flex min-h-80 flex-col items-center justify-center rounded-2xl border border-border bg-muted/30 px-4 text-center sm:min-h-100 sm:px-6">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-background text-2xl shadow-sm">
            ⚠️
          </div>

          <h2 className="text-xl font-semibold">Something went wrong</h2>

          <p className="mt-2 max-w-md text-sm text-muted-foreground">{error}</p>

          <Button className="mt-6" onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      ) : paginatedProducts.length > 0 ? (
        <>
          {/* Responsive product grid */}
          <div className="grid min-w-0 grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
            {paginatedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination className="mt-8 max-w-full overflow-x-auto sm:mt-10">
              <PaginationContent className="flex-nowrap">
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => {
                      if (currentPage > 1) {
                        setCurrentPage(currentPage - 1);
                      }
                    }}
                    className={
                      currentPage === 1
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>

                {Array.from({ length: totalPages }, (_, index) => {
                  const page = index + 1;

                  return (
                    <PaginationItem key={page}>
                      <PaginationLink
                        onClick={() => setCurrentPage(page)}
                        isActive={currentPage === page}
                        className="cursor-pointer"
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}

                <PaginationItem>
                  <PaginationNext
                    onClick={() => {
                      if (currentPage < totalPages) {
                        setCurrentPage(currentPage + 1);
                      }
                    }}
                    className={
                      currentPage === totalPages
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </>
      ) : (
        <div className="flex min-h-80 flex-col items-center justify-center rounded-2xl border border-border bg-muted/30 px-4 text-center sm:min-h-100 sm:px-6">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-background text-2xl shadow-sm">
            🔍
          </div>

          <h2 className="text-xl font-semibold text-foreground">
            No products found
          </h2>

          <p className="mt-2 max-w-md break-words text-sm text-muted-foreground">
            We couldn't find any products matching "{searchQuery}". Try changing
            your search or filters.
          </p>

          <Button className="mt-6" onClick={clearAllFilters}>
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  );
}

export default ProductList;
