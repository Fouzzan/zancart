import { Button } from "@/components/ui/button";
import { removeFromWishlist } from "@/redux/slices/wishlistSlice";
import { Heart } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import ProductCard from "../components/ProductCard";

function Wishlist() {
  const dispatch = useDispatch();

  const wishlistItems = useSelector((state) => state.wishlist.items);

  if (wishlistItems.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
        <Heart className="mb-4 h-12 w-12 text-muted-foreground" />

        <h1 className="text-2xl font-bold">Your wishlist is empty</h1>

        <p className="mt-2 text-muted-foreground">
          Save products you love and find them here later.
        </p>

        <Button asChild className="mt-6 rounded-full">
          <Link to="/products">Continue Shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">My Wishlist</h1>

        <p className="mt-1 text-muted-foreground">
          {wishlistItems.length} {wishlistItems.length === 1 ? "item" : "items"}{" "}
          saved
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {wishlistItems.map((product) => (
          <div key={product.id} className="relative">
            <ProductCard product={product} />

            <Button
              variant="outline"
              size="sm"
              className="mt-2 w-full rounded-full"
              onClick={() => dispatch(removeFromWishlist(product.id))}
            >
              Remove from Wishlist
            </Button>
          </div>
        ))}
      </div>
    </main>
  );
}

export default Wishlist;
