import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  brands: [],
  loading: false,
  error: null,
};

const brandSlice = createSlice({
  name: "brands",

  initialState,

  reducers: {
    setBrands: (state, action) => {
      state.brands = action.payload;
    },

    addBrand: (state, action) => {
      state.brands.push(action.payload);
    },

    updateBrand: (state, action) => {
      const index = state.brands.findIndex(
        (brand) => brand.id === action.payload.id,
      );

      if (index !== -1) {
        state.brands[index] = action.payload;
      }
    },

    removeBrand: (state, action) => {
      state.brands = state.brands.filter(
        (brand) => brand.id !== action.payload,
      );
    },

    setLoading: (state, action) => {
      state.loading = action.payload;
    },

    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const {
  setBrands,
  addBrand,
  updateBrand,
  removeBrand,
  setLoading,
  setError,
} = brandSlice.actions;

export default brandSlice.reducer;