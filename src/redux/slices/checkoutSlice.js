import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  selectedAddress: null,
  paymentMethod: null,
  coupon: null,
};

const checkoutSlice = createSlice({
  name: "checkout",
  initialState,

  reducers: {
    setSelectedAddress: (state, action) => {
      state.selectedAddress = action.payload;
    },

    setPaymentMethod: (state, action) => {
      state.paymentMethod = action.payload;
    },

    setCoupon: (state, action) => {
      state.coupon = action.payload;
    },

    clearCheckout: (state) => {
      state.selectedAddress = null;
      state.paymentMethod = null;
      state.coupon = null;
    },
  },
});

export const {
  setSelectedAddress,
  setPaymentMethod,
  setCoupon,
  clearCheckout,
} = checkoutSlice.actions;

export default checkoutSlice.reducer;