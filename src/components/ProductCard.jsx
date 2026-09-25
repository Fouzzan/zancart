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
  const discount = Math.round(
    ((product.price - product.discountPrice) / product.price) * 100,
  );

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const isWishlisted = useSelector((state) =>
    state.wishlist.items.some((item) => item.id === product.id),
  );

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const alreadyWishlisted = isWishlisted;

    dispatch(toggleWishlist(product));

    toast.success(
      alreadyWishlisted ? "Removed from wishlist" : "Added to wishlist",
    );
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();

    console.log("ADD TO CART CLICKED");

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
      className="group cursor-pointer overflow-hidden border-0 shadow-sm transition hover:shadow-lg"
    >
      <div className="relative overflow-hidden">
        <img
          src={product.images[0]}
          alt={product.title}
          className="h-64 w-full object-cover transition duration-300 group-hover:scale-105"
        />

        {discount > 0 && (
          <span className="absolute left-3 top-3 rounded-full bg-black px-3 py-1 text-xs font-medium text-white">
            {discount}% OFF
          </span>
        )}

        <Button
          type="button"
          variant="secondary"
          size="icon"
          className="absolute right-3 top-3 rounded-full border border-white/40 bg-white/30 shadow-lg backdrop-blur-md transition-transform duration-300 ease-in-out hover:scale-130 hover:bg-white/30"
          onClick={handleWishlist}
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart
            className={cn(
              "h-5 w-5 transition-colors",
              isWishlisted && "fill-red-500 text-red-500",
            )}
          />
        </Button>
      </div>

      <CardContent className="p-4">
        <p className="text-sm text-muted-foreground">{product.brand}</p>

        <h3 className="mt-1 font-semibold">{product.title}</h3>

        <div className="mt-2 flex items-center gap-1 text-sm">
          <span>⭐</span>
          <span>{product.rating}</span>
          <span className="text-muted-foreground">({product.reviewCount})</span>
        </div>

        <div className="mt-3 flex items-center gap-2">
          <span className="font-bold">₹{product.discountPrice}</span>

          <span className="text-sm text-muted-foreground line-through">
            ₹{product.price}
          </span>
        </div>

        <div className="mt-4 flex gap-2">
          <Button className="flex-1" type="button" onClick={handleAddToCart}>
            Add to Cart
          </Button>

          <Button
            className="flex-1"
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
