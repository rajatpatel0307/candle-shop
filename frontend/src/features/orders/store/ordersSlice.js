import { createSlice } from '@reduxjs/toolkit';

const ordersSlice = createSlice({
  name: 'orders',
  initialState: { lastViewedOrderId: null },
  reducers: {
    setLastViewedOrder(state, action) {
      state.lastViewedOrderId = action.payload;
    },
  },
});

export const { setLastViewedOrder } = ordersSlice.actions;
export default ordersSlice.reducer;
