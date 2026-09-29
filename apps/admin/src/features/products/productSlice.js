import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  products: [],
  loading: false,
  error: null,
};

const productSlice = createSlice({
  name: "products",

  initialState,

  reducers: {
    setProducts: (state, action) => {
      state.products = action.payload;
    },

    addProduct: (state, action) => {
      state.products.unshift(action.payload);
    },

    updateProduct: (state, action) => {
      const index = state.products.findIndex(
        (product) => String(product.id) === String(action.payload.id)
      );

      if (index !== -1) {
        state.products[index] = action.payload;
      }
    },

    removeProduct: (state, action) => {
      state.products = state.products.filter(
        (product) => String(product.id) !== String(action.payload)
      );
    },

    setLoading: (state, action) => {
      state.loading = action.payload;
    },

    setError: (state, action) => {
      state.error = action.payload;
    },

    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  setProducts,
  addProduct,
  updateProduct,
  removeProduct,
  setLoading,
  setError,
  clearError,
} = productSlice.actions;

export default productSlice.reducer;