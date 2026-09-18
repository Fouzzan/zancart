import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  items: [],
  wishlistId: null,
};

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState,

  reducers: {
    addToWishlist: (state, action) => {
      const product = action.payload;

      const exists = state.items.some(
        (item) => item.id === product.id
      );

      if (!exists) {
        state.items.push(product);
      }
    },

    removeFromWishlist: (state, action) => {
      state.items = state.items.filter(
        (item) => item.id !== action.payload
      );
    },

    toggleWishlist: (state, action) => {
      const product = action.payload;

      const index = state.items.findIndex(
        (item) => item.id === product.id
      );

      if (index >= 0) {
        state.items.splice(index, 1);
      } else {
        state.items.push(product);
      }
    },

    clearWishlist: (state) => {
      state.items = [];
    },

    setWishlist: (state, action) => {
      state.items = action.payload.items;
      state.wishlistId = action.payload.wishlistId;
    },
  },
});

export const {
  addToWishlist,
  removeFromWishlist,
  toggleWishlist,
  clearWishlist,
  setWishlist,
} = wishlistSlice.actions;

export default wishlistSlice.reducer;