import { useUser } from "@clerk/react";
import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";

import { setWishlist } from "../redux/slices/wishlistSlice";
import {
  createUserWishlist,
  getUserWishlist,
  updateUserWishlist,
} from "../services/wishlistServices";

function WishlistSync() {
  const { user, isLoaded } = useUser();
  const dispatch = useDispatch();

  const items = useSelector((state) => state.wishlist.items);
  const wishlistId = useSelector((state) => state.wishlist.wishlistId);

  const isWishlistLoaded = useRef(false);
  const previousItems = useRef(null);

  // Load wishlist when user logs in
  useEffect(() => {
    if (!isLoaded) return;

    const loadWishlist = async () => {
      isWishlistLoaded.current = false;

      if (!user) {
        dispatch(
          setWishlist({
            items: [],
            wishlistId: null,
          }),
        );

        isWishlistLoaded.current = true;
        previousItems.current = [];

        return;
      }

      try {
        const wishlist = await getUserWishlist(user.id);

        if (wishlist) {
          dispatch(
            setWishlist({
              items: wishlist.items,
              wishlistId: wishlist.id,
            }),
          );

          previousItems.current = wishlist.items;
        } else {
          const newWishlist = await createUserWishlist(user.id, []);

          dispatch(
            setWishlist({
              items: newWishlist.items,
              wishlistId: newWishlist.id,
            }),
          );

          previousItems.current = newWishlist.items;
        }

        isWishlistLoaded.current = true;
      } catch (error) {
        console.error("Failed to load wishlist:", error);
      }
    };

    loadWishlist();
  }, [user, isLoaded, dispatch]);

  // Save wishlist whenever items change
  useEffect(() => {
    if (!isWishlistLoaded.current || !user || !wishlistId) {
      return;
    }

    if (JSON.stringify(previousItems.current) === JSON.stringify(items)) {
      return;
    }

    const saveWishlist = async () => {
      try {
        await updateUserWishlist(wishlistId, items);

        previousItems.current = items;
      } catch (error) {
        console.error("Failed to save wishlist:", error);
      }
    };

    saveWishlist();
  }, [items, wishlistId, user]);

  return null;
}

export default WishlistSync;
