import { Button } from "@/components/ui/button";
import {
  decreaseQuantity,
  increaseQuantity,
  removeFromCart,
} from "@/redux/slices/cartSlice";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";

function Cart() {
  const items = useSelector((state) => state.cart.items);
  const dispatch = useDispatch();

  const subtotal = items.reduce((total, item) => {
    return total + item.discountPrice * item.quantity;
  }, 0);

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 text-center">
        <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground" />

        <h1 className="mt-4 text-2xl font-bold">Your cart is empty</h1>

        <p className="mt-2 text-muted-foreground">
          Looks like you haven't added anything yet.
        </p>

        <Link to="/products">
          <Button className="mt-6 rounded-full px-8">Continue Shopping</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Shopping Cart</h1>

        <p className="mt-1 text-sm text-muted-foreground">
          {items.length} {items.length === 1 ? "item" : "items"} in your cart
        </p>
      </div>

      {/* Main Layout */}
      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
        {/* =========================
            ORDER SUMMARY
        ========================== */}
        <div className="order-1 lg:order-2">
          <div className="rounded-2xl border bg-background p-6 lg:sticky lg:top-24">
            <h2 className="text-xl font-semibold">Order Summary</h2>

            <div className="mt-6 space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>

                <span>₹{subtotal}</span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Delivery</span>

                <span className="font-medium text-green-600">Free</span>
              </div>
            </div>

            <div className="my-6 border-t" />

            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>

              <span>₹{subtotal}</span>
            </div>

            <Link to="/checkout" className="block">
              <Button
                type="button"
                className="mt-6 h-12 w-full rounded-xl text-base"
              >
                Proceed to Buy
              </Button>
            </Link>

            <Link
              to="/products"
              className="mt-4 block text-center text-sm text-muted-foreground hover:text-foreground"
            >
              Continue Shopping
            </Link>
          </div>
        </div>

        {/* =========================
            CART ITEMS
        ========================== */}
        <div className="order-2 space-y-4 lg:order-1">
          <h2 className="text-lg font-semibold">Your Items</h2>

          {items.map((item) => (
            <div key={item.id} className="rounded-2xl border p-4 sm:p-5">
              <div className="flex gap-4">
                {/* Product Image */}
                <Link to={`/products/${item.id}`} className="shrink-0">
                  <img
                    src={item.images[0]}
                    alt={item.title}
                    className="h-28 w-28 rounded-xl object-cover sm:h-32 sm:w-32"
                  />
                </Link>

                {/* Product Information */}
                <div className="min-w-0 flex-1">
                  <div className="flex justify-between gap-3">
                    <div>
                      <Link
                        to={`/products/${item.id}`}
                        className="font-semibold hover:underline"
                      >
                        {item.title}
                      </Link>

                      <p className="mt-1 text-sm text-muted-foreground">
                        {item.brand}
                      </p>
                    </div>

                    {/* Remove */}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => dispatch(removeFromCart(item.id))}
                      className="shrink-0 text-muted-foreground hover:text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Price */}
                  <div className="mt-3 flex items-center gap-2">
                    <span className="font-semibold">₹{item.discountPrice}</span>

                    <span className="text-sm text-muted-foreground line-through">
                      ₹{item.price}
                    </span>
                  </div>

                  {/* Quantity + Item Total */}
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                    {/* Quantity */}
                    <div className="flex items-center rounded-lg border">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => dispatch(decreaseQuantity(item.id))}
                        disabled={item.quantity <= 1}
                        className="h-8 w-8"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </Button>

                      <span className="w-8 text-center text-sm font-medium">
                        {item.quantity}
                      </span>

                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => dispatch(increaseQuantity(item.id))}
                        className="h-8 w-8"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </Button>
                    </div>

                    {/* Item Total */}
                    <span className="font-semibold">
                      ₹{item.discountPrice * item.quantity}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Cart;
