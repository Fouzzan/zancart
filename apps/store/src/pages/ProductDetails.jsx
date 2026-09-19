import ReviewSection from "@/components/ReviewSection";
import { Button } from "@/components/ui/button";
import { addToCart } from "@/redux/slices/cartSlice";
import { Heart } from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useParams } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { toggleWishlist } from "../redux/slices/wishlistSlice";
import api from "../services/api";
import { toast } from "sonner";

function ProductDetails() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const { id } = useParams();
  const dispatch = useDispatch();

  const isWishlisted = useSelector((state) =>
    state.wishlist.items.some((item) => item.id === product?.id),
  );

  useEffect(() => {
    const fetchProduct = async () => {
      const response = await api.get(`/products/${id}`);
      const currentProduct = response.data;

      setProduct(currentProduct);
      setSelectedImage(response.data.images[0]);

      const relatedResponse = await api.get(
        `/products?category=${encodeURIComponent(currentProduct.category)}`,
      );

      const related = relatedResponse.data
        .filter((item) => item.id !== currentProduct.id)
        .slice(0, 6);

      setRelatedProducts(related);
    };

    fetchProduct();
  }, [id]);

  if (!product) {
    return <p>Loading...</p>;
  }
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Back */}
      <Link
        to="/products"
        className="mb-6 inline-flex text-sm text-muted-foreground hover:text-foreground"
      >
        ← Back to Products
      </Link>

      {/* Main Product */}
      <div className="grid gap-10 md:grid-cols-2">
        {/* LEFT — Images */}
        <div>
          {/* Main Image */}
          <div className="overflow-hidden rounded-2xl border bg-muted/20">
            <img
              src={selectedImage}
              alt={product.title}
              className="h-[450px] w-full object-cover md:h-[550px]"
            />
          </div>

          {/* Image Thumbnails */}
          <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
            {product.images.map((image, index) => (
              <button
                type="button"
                key={index}
                onClick={() => setSelectedImage(image)}
                className={`shrink-0 overflow-hidden rounded-xl border-2 transition ${
                  selectedImage === image
                    ? "border-foreground"
                    : "border-transparent"
                }`}
              >
                <img
                  src={image}
                  alt={`${product.title} ${index + 1}`}
                  className="h-20 w-20 object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        {/* RIGHT — Product Information */}
        <div className="flex flex-col">
          {/* Brand */}
          <p className="text-sm font-medium text-muted-foreground">
            {product.brand}
          </p>

          {/* Title */}
          <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
            {product.title}
          </h1>

          {/* Rating */}
          <div className="mt-4 flex items-center gap-2">
            <span className="text-yellow-500">★</span>

            <span className="font-medium">{product.rating}</span>

            <span className="text-muted-foreground">
              ({product.reviewCount} reviews)
            </span>
          </div>

          {/* Price */}
          <div className="mt-6 flex items-center gap-3">
            <span className="text-3xl font-bold">₹{product.discountPrice}</span>

            <span className="text-lg text-muted-foreground line-through">
              ₹{product.price}
            </span>

            <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
              {Math.round(
                ((product.price - product.discountPrice) / product.price) * 100,
              )}
              % OFF
            </span>
          </div>

          {/* Description */}
          <p className="mt-6 leading-7 text-muted-foreground">
            {product.description}
          </p>

          <div className="my-6 border-t" />

          {/* Stock */}
          <div className="flex items-center justify-between">
            <span className="font-medium">Availability</span>

            <span
              className={
                product.stock > 0
                  ? "font-medium text-green-600"
                  : "font-medium text-red-500"
              }
            >
              {product.stock > 0
                ? `In Stock (${product.stock})`
                : "Out of Stock"}
            </span>
          </div>

          {/* Quantity */}
          <div className="mt-6 flex items-center gap-4">
            <span className="font-medium">Quantity</span>

            <div className="flex items-center rounded-lg border">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
              >
                −
              </Button>

              <span className="w-10 text-center font-medium">{quantity}</span>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                disabled={quantity >= product.stock}
                onClick={() =>
                  setQuantity((prev) => Math.min(product.stock, prev + 1))
                }
              >
                +
              </Button>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-8 flex gap-3">
            <Button
              type="button"
              disabled={product.stock === 0}
              onClick={() => {
                dispatch(
                  addToCart({
                    product,
                    quantity,
                  }),
                );
              }}
              className="h-12 flex-1 rounded-xl"
            >
              Add to Cart
            </Button>

            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => dispatch(toggleWishlist(product))}
              className="h-12 w-12 shrink-0 rounded-xl"
            >
              <Heart
                className={isWishlisted ? "fill-red-500 text-red-500" : ""}
              />
            </Button>
          </div>

          {/* View Cart */}
          <Link
            to="/cart"
            className="mt-4 text-center text-sm font-medium underline underline-offset-4"
          >
            View Cart
          </Link>

          {/* Benefits */}
          <div className="mt-8 grid grid-cols-3 gap-3 rounded-xl bg-muted/40 p-4">
            <div className="text-center">
              <p className="text-sm font-medium">Free Delivery</p>
              <p className="mt-1 text-xs text-muted-foreground">
                On eligible orders
              </p>
            </div>

            <div className="border-x px-2 text-center">
              <p className="text-sm font-medium">Easy Returns</p>
              <p className="mt-1 text-xs text-muted-foreground">Hassle-free</p>
            </div>

            <div className="text-center">
              <p className="text-sm font-medium">Secure Payment</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Safe checkout
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="mt-20">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-bold">You may also like</h2>

              <p className="mt-1 text-sm text-muted-foreground">
                More products from {product.category}
              </p>
            </div>

            <Link
              to="/products"
              className="text-sm font-medium underline underline-offset-4"
            >
              View All
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
            {relatedProducts.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      )}

      <ReviewSection productId={id} />
    </div>
  );
}

export default ProductDetails;
