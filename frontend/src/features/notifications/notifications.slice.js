import { createSlice } from '@reduxjs/toolkit';
const slice = createSlice({ name: 'notifications', initialState: { unreadCount: 0 }, reducers: { setUnreadCount: (s, a) => { s.unreadCount = a.payload || 0; } } });
export const { setUnreadCount } = slice.actions;
export default slice.reducer;
