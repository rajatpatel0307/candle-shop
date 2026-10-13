import { createSlice } from '@reduxjs/toolkit';
const slice = createSlice({ name: 'reviews', initialState: { lastProductId: null }, reducers: { setLastReviewProduct: (s, a) => { s.lastProductId = a.payload; } } });
export const { setLastReviewProduct } = slice.actions;
export default slice.reducer;
