import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useAuthContext } from "../context/AuthContext";
import { setWishlist } from "../redux/slices/wishlistSlice";
import {
  createUserWishlist,
  getUserWishlist,
  updateUserWishlist,
} from "../services/wishlistServices";

function WishlistSync() {
  const { user, isLoading } = useAuthContext();
  const dispatch = useDispatch();

  const items = useSelector((state) => state.wishlist.items);
  const wishlistId = useSelector((state) => state.wishlist.wishlistId);

  const userId = user?.userId || user?.id || null;
  const loadedForUser = useRef(null);

  useEffect(() => {
    if (isLoading) return;

    let cancelled = false;

    async function loadWishlist() {
      loadedForUser.current = null;

      if (!userId) {
        dispatch(setWishlist({ items: [], wishlistId: null }));
        return;
      }

      try {
        let wishlist = await getUserWishlist(userId);

        if (!wishlist) {
          wishlist = await createUserWishlist(userId, []);
        }

        if (cancelled) return;

        dispatch(
          setWishlist({
            items: wishlist.items || [],
            wishlistId: wishlist.id,
          }),
        );

        loadedForUser.current = userId;
      } catch (error) {
        console.error("Failed to load wishlist:", error);
      }
    }

    loadWishlist();

    return () => {
      cancelled = true;
    };
  }, [userId, isLoading, dispatch]);

  useEffect(() => {
    if (
      isLoading ||
      !userId ||
      !wishlistId ||
      loadedForUser.current !== userId
    ) {
      return;
    }

    const timeout = setTimeout(async () => {
      try {
        await updateUserWishlist(wishlistId, items);
      } catch (error) {
        console.error("Failed to save wishlist:", error);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [items, wishlistId, userId, isLoading]);

  return null;
}

export default WishlistSync;
