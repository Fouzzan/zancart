import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { addToCart } from "@/redux/slices/cartSlice";
import { Heart } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { toggleWishlist } from "../redux/slices/wishlistSlice";

function ProductCard({ product }) {
  const price = Number(product.price) || 0;
  const discountPrice = Number(product.discountPrice) || 0;

  const discount =
    price > 0 ? Math.round(((price - discountPrice) / price) * 100) : 0;

  const image = product.images?.[0] || product.image || "";

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const isWishlisted = useSelector((state) =>
    state.wishlist.items.some((item) => item.id === product.id),
  );

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();

    dispatch(toggleWishlist(product));

    toast.success(isWishlisted ? "Removed from wishlist" : "Added to wishlist");
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();

    dispatch(addToCart({ product, quantity: 1 }));
    toast.success("Added to cart");
  };

  const handleBuyNow = (e) => {
    e.preventDefault();
    e.stopPropagation();

    dispatch(addToCart({ product, quantity: 1 }));
    toast.success("Added to cart");
    navigate("/cart");
  };

  const handleCardClick = () => {
    navigate(`/products/${product.id}`);
  };

  return (
    <Card
      onClick={handleCardClick}
      className="group min-w-0 cursor-pointer overflow-hidden rounded-xl border border-gray-200/80 bg-white shadow-sm transition-shadow duration-300 hover:shadow-md"
    >
      {/* Product image */}
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-gray-100">
        {image ? (
          <img
            src={image}
            alt={product.title || "Product"}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-gray-400">
            No image available
          </div>
        )}

        {/* Discount badge */}
        {discount > 0 && (
          <span className="absolute left-2 top-2 max-w-[calc(100%-3.5rem)] truncate rounded-full bg-black/90 px-2.5 py-1 text-[10px] font-semibold text-white sm:left-3 sm:top-3 sm:text-xs">
            {discount}% OFF
          </span>
        )}

        {/* Wishlist button */}
        <Button
          type="button"
          variant="secondary"
          size="icon"
          onClick={handleWishlist}
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          className="absolute right-2 top-2 h-8 w-8 rounded-full border border-white/60 bg-white/75 shadow-sm backdrop-blur-xl transition-transform hover:scale-105 hover:bg-white sm:right-3 sm:top-3 sm:h-9 sm:w-9"
        >
          <Heart
            className={cn(
              "h-4 w-4 transition-colors sm:h-[18px] sm:w-[18px]",
              isWishlisted ? "fill-red-500 text-red-500" : "text-gray-700",
            )}
          />
        </Button>
      </div>

      {/* Product information */}
      <CardContent className="min-w-0 space-y-1.5 p-2.5 sm:space-y-2 sm:p-4">
        <p className="truncate text-[11px] text-muted-foreground sm:text-sm">
          {product.brand || "ZanCart"}
        </p>

        <h3
          title={product.title}
          className="line-clamp-2 min-h-[2rem] break-words text-xs font-semibold leading-4 text-gray-900 sm:min-h-0 sm:text-base sm:leading-5"
        >
          {product.title}
        </h3>

        {/* Rating */}
        <div className="flex min-w-0 items-center gap-1 text-[11px] sm:text-sm">
          <span aria-hidden="true">⭐</span>
          <span className="font-medium">{product.rating ?? "N/A"}</span>
          <span className="truncate text-muted-foreground">
            ({product.reviewCount ?? 0})
          </span>
        </div>

        {/* Price */}
        <div className="flex min-w-0 flex-wrap items-baseline gap-x-1.5 gap-y-0.5 pt-0.5">
          <span className="text-sm font-bold text-gray-900 sm:text-base">
            ₹{discountPrice.toLocaleString("en-IN")}
          </span>

          {price > discountPrice && (
            <span className="text-[10px] text-muted-foreground line-through sm:text-sm">
              ₹{price.toLocaleString("en-IN")}
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="grid grid-cols-1 gap-1.5 pt-1 sm:grid-cols-2 sm:gap-2 sm:pt-2">
          <Button
            className="h-8 min-w-0 px-2 text-[11px] sm:h-9 sm:text-sm"
            type="button"
            onClick={handleAddToCart}
          >
            Add to Cart
          </Button>

          <Button
            className="h-8 min-w-0 px-2 text-[11px] sm:h-9 sm:text-sm"
            type="button"
            variant="outline"
            onClick={handleBuyNow}
          >
            Buy Now
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default ProductCard;
