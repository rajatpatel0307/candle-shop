import { createSlice } from '@reduxjs/toolkit';
const slice = createSlice({ name: 'support', initialState: { lastTicketId: null }, reducers: { setLastTicket: (s, a) => { s.lastTicketId = a.payload; } } });
export const { setLastTicket } = slice.actions;
export default slice.reducer;
