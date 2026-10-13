import { createSlice } from '@reduxjs/toolkit';

const slice = createSlice({
  name: 'home',
  initialState: { lastLoadedAt: null },
  reducers: {
    markHomeLoaded: (state) => {
      state.lastLoadedAt = new Date().toISOString();
    },
  },
});

export const { markHomeLoaded } = slice.actions;
export default slice.reducer;
