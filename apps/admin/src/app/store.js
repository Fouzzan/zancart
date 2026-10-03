import { configureStore } from "@reduxjs/toolkit";

import categoryReducer from "../features/categories/categorySlice";
import authReducer from "../features/auth/authSlice";
import productReducer from "../features/products/productSlice";
import brandReducer from "@/features/brands/brandSlice";
import userReducer from "../features/users/userSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    products: productReducer,
    categories: categoryReducer,
    brands: brandReducer,
    users: userReducer,
  },
});