import { createSlice } from "@reduxjs/toolkit";


const initialState = {
    items: [],
    cartId: null,
}

const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
            addToCart: (state, action) => {
    const { product, quantity } = action.payload;

    const existingItem = state.items.find(
        (item) => item.id === product.id
    );

    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        state.items.push({
        ...product,
        quantity,
        });
    }
    },
        increaseQuantity: (state, action) => {
            const item = state.items.find(
                item => item.id === action.payload
            )
            if(item){
                item.quantity += 1
            }
            
        },
        decreaseQuantity: (state, action) => {
            const item = state.items.find(
                item => item.id === action.payload
            )
            if(item && item.quantity > 1){
                item.quantity -= 1
            }
        }, 
        removeFromCart: (state, action) => {
            state.items = state.items.filter(
                item => item.id !== action.payload
            )
        },
        setCart: (state, action) => {
            state.items = action.payload.items;
            state.cartId = action.payload.cartId;
        }
    }
})

export default cartSlice.reducer;
export const { addToCart, increaseQuantity, decreaseQuantity, removeFromCart, setCart } = cartSlice.actions;