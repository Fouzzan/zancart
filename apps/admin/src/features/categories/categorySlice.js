import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  categories: [],
  loading: false,
  error: null,
};

const categorySlice = createSlice({
  name: "categories",
  initialState,
  reducers: {
    setCategories: (state, action) => {
      state.categories = action.payload;
    },

    addCategory: (state, action) => {
      state.categories.push(action.payload);
    },

    updateCategory: (state, action) => {
      const index = state.categories.findIndex(
        (category) =>
          String(category.id) === String(action.payload.id)
      );

      if (index !== -1) {
        state.categories[index] = action.payload;
      }
    },

    removeCategory: (state, action) => {
      state.categories = state.categories.filter(
        (category) =>
          String(category.id) !== String(action.payload)
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
  setCategories,
  addCategory,
  updateCategory,
  removeCategory,
  setLoading,
  setError,
  clearError,
} = categorySlice.actions;

export default categorySlice.reducer;