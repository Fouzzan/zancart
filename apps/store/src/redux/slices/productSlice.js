
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    products: [], 
    loading: false,
    error: null
}

const productSlice = createSlice({
    name: 'product',
    initialState,
    reducers: {
        setProducts: (state, action) => {
            state.products = action.payload;
        }, 
        setLoading: (state, action) => {
            state.loading = action.payload;

        },
        setError: (state,action) => {
            state.error = action.payload;
            state.loading = false;
        }
    }
})

export default productSlice.reducer;
export const { setProducts, setLoading, setError } = productSlice.actions;
