import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useAuthContext } from "../context/AuthContext";
import { setCart } from "../redux/slices/cartSlice";
import {
  createUserCart,
  getUserCart,
  updateUserCart,
} from "../services/cartServices";

function CartSync() {
  const { user, isLoading } = useAuthContext();
  const dispatch = useDispatch();

  const items = useSelector((state) => state.cart.items);
  const cartId = useSelector((state) => state.cart.cartId);

  const isCartLoaded = useRef(false);
  const previousItems = useRef(null);
  const activeUserId = user?.userId || user?.id || null;

  useEffect(() => {
    if (isLoading) return;

    let cancelled = false;

    async function loadCart() {
      isCartLoaded.current = false;

      if (!activeUserId) {
        dispatch(setCart({ items: [], cartId: null }));
        previousItems.current = [];
        isCartLoaded.current = true;
        return;
      }

      try {
        const cart = await getUserCart(activeUserId);

        if (cancelled) return;

        if (cart) {
          dispatch(
            setCart({
              items: cart.items || [],
              cartId: cart.id,
            }),
          );
          previousItems.current = cart.items || [];
        } else {
          const newCart = await createUserCart(activeUserId, []);

          if (cancelled) return;

          dispatch(
            setCart({
              items: newCart.items || [],
              cartId: newCart.id,
            }),
          );
          previousItems.current = newCart.items || [];
        }

        isCartLoaded.current = true;
      } catch (error) {
        console.error("Failed to load cart:", error);
      }
    }

    loadCart();

    return () => {
      cancelled = true;
    };
  }, [activeUserId, isLoading, dispatch]);

  useEffect(() => {
    if (!isCartLoaded.current || !activeUserId || !cartId) return;

    if (JSON.stringify(previousItems.current) === JSON.stringify(items)) {
      return;
    }

    async function saveCart() {
      try {
        await updateUserCart(cartId, items);
        previousItems.current = items;
      } catch (error) {
        console.error("Failed to save cart:", error);
      }
    }

    saveCart();
  }, [items, cartId, activeUserId]);

  return null;
}

export default CartSync;
