import { configureStore } from "@reduxjs/toolkit";

import cartReducer from "./slices/cartSlice";
import checkoutReducer from './slices/checkoutSlice';
import productReducer from "./slices/productSlice";
import wishlistReducer from "./slices/wishlistSlice";

export const store = configureStore({
  reducer: {
    product: productReducer,
    cart: cartReducer,
    wishlist: wishlistReducer,
    checkout: checkoutReducer,
  },
});