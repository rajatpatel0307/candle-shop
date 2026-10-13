import { createSlice } from '@reduxjs/toolkit';

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState: { count: 0 },
  reducers: {
    setWishlistSummary(state, action) {
      state.count = action.payload?.totalItems || 0;
    },
    clearWishlistSummary(state) {
      state.count = 0;
    },
  },
});

export const { clearWishlistSummary, setWishlistSummary } = wishlistSlice.actions;
export default wishlistSlice.reducer;
