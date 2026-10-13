import { createSlice } from '@reduxjs/toolkit';

const checkoutSlice = createSlice({
  name: 'checkout',
  initialState: { sessionId: null, orderId: null },
  reducers: {
    setCheckoutSession(state, action) {
      state.sessionId = action.payload;
    },
    setCheckoutOrder(state, action) {
      state.orderId = action.payload;
    },
    clearCheckout(state) {
      state.sessionId = null;
      state.orderId = null;
    },
  },
});

export const { clearCheckout, setCheckoutOrder, setCheckoutSession } = checkoutSlice.actions;
export default checkoutSlice.reducer;
