import { useUser } from "@clerk/react";
import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";

import { setCart } from "../redux/slices/cartSlice";
import {
  createUserCart,
  getUserCart,
  updateUserCart,
} from "../services/cartServices";

function CartSync() {
  const { user, isLoaded } = useUser();
  const dispatch = useDispatch();

  const items = useSelector((state) => state.cart.items);
  const cartId = useSelector((state) => state.cart.cartId);

  const isCartLoaded = useRef(false);
  const previousItems = useRef(null);

  // Load user's cart
  useEffect(() => {
    if (!isLoaded) return;

    const loadCart = async () => {
      isCartLoaded.current = false;

      if (!user) {
        dispatch(
          setCart({
            items: [],
            cartId: null,
          }),
        );

        isCartLoaded.current = true;
        previousItems.current = [];
        return;
      }

      try {
        const cart = await getUserCart(user.id);

        if (cart) {
          dispatch(
            setCart({
              items: cart.items,
              cartId: cart.id,
            }),
          );

          previousItems.current = cart.items;
        } else {
          const newCart = await createUserCart(user.id, []);

          dispatch(
            setCart({
              items: newCart.items,
              cartId: newCart.id,
            }),
          );

          previousItems.current = newCart.items;
        }

        isCartLoaded.current = true;
      } catch (error) {
        console.error("Failed to load cart:", error);
      }
    };

    loadCart();
  }, [user, isLoaded, dispatch]);

  // Save cart when the user actually changes it
  useEffect(() => {
    if (!isCartLoaded.current || !user || !cartId) return;

    // Don't save if items haven't actually changed
    if (JSON.stringify(previousItems.current) === JSON.stringify(items)) {
      return;
    }

    const saveCart = async () => {
      try {
        await updateUserCart(cartId, items);

        previousItems.current = items;
      } catch (error) {
        console.error("Failed to save cart:", error);
      }
    };

    saveCart();
  }, [items, cartId, user]);

  return null;
}

export default CartSync;
