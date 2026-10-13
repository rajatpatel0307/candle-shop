import { createSlice } from '@reduxjs/toolkit';

const slice = createSlice({
  name: 'content',
  initialState: { currentSlug: null },
  reducers: {
    setCurrentSlug: (state, action) => {
      state.currentSlug = action.payload;
    },
  },
});

export const { setCurrentSlug } = slice.actions;
export default slice.reducer;
