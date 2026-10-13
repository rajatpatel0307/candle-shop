import { createSlice } from '@reduxjs/toolkit';

const cartSlice = createSlice({
  name: 'cart',
  initialState: { count: 0, subtotal: 0 },
  reducers: {
    setCartSummary(state, action) {
      state.count = action.payload?.totalQuantity || 0;
      state.subtotal = action.payload?.subtotal || 0;
    },
    clearCartSummary(state) {
      state.count = 0;
      state.subtotal = 0;
    },
  },
});

export const { clearCartSummary, setCartSummary } = cartSlice.actions;
export default cartSlice.reducer;
