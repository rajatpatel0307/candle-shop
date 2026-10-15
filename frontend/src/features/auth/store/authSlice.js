import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { authApi } from '../api/authApi.js';

export const loadCurrentUser = createAsyncThunk('auth/me', async (_, { rejectWithValue }) => {
  try {
    const response = await authApi.me();
    return response.data.user;
  } catch (error) {
    return rejectWithValue(error.response?.data?.error?.message || 'Not authenticated.');
  }
});

export const loginUser = createAsyncThunk('auth/login', async (payload, { rejectWithValue }) => {
  try {
    const response = await authApi.login(payload);
    return response.data.user;
  } catch (error) {
    return rejectWithValue({
      code: error.response?.data?.error?.code,
      message: error.response?.data?.error?.message || error.response?.data?.message || 'Login failed.',
      retryAfterSeconds: error.response?.status === 429 ? Math.max(1, Number(error.response.headers?.['retry-after']) || 900) : undefined,
    });
  }
});

export const registerUser = createAsyncThunk('auth/register', async (payload, { rejectWithValue }) => {
  try {
    const response = await authApi.register(payload);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.error?.message || error.response?.data?.message || 'Registration failed.');
  }
});

export const verifyEmailUser = createAsyncThunk('auth/verifyEmail', async (payload, { rejectWithValue }) => {
  try {
    const response = await authApi.verifyEmail(payload);
    return response.data.user;
  } catch (error) {
    return rejectWithValue(error.response?.data?.error?.message || error.response?.data?.message || 'Email verification failed.');
  }
});

export const logoutUser = createAsyncThunk('auth/logout', async () => {
  await authApi.logout();
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    status: 'idle',
    error: null,
    errorCode: null,
    pendingVerificationEmail: null,
  },
  reducers: {
    setCurrentUser(state, action) {
      state.user = action.payload;
    },
    clearAuthError(state) {
      state.error = null;
      state.errorCode = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadCurrentUser.pending, (state) => {
        state.status = 'loading';
        state.errorCode = null;
      })
      .addCase(loadCurrentUser.fulfilled, (state, action) => {
        state.status = 'authenticated';
        state.user = action.payload;
      })
      .addCase(loadCurrentUser.rejected, (state) => {
        state.status = 'anonymous';
        state.user = null;
      })
      .addCase(loginUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
        state.errorCode = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = 'authenticated';
        state.user = action.payload;
        state.errorCode = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = 'anonymous';
        state.error = action.payload?.message || action.payload;
        state.errorCode = action.payload?.code || null;
      })
      .addCase(registerUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
        state.errorCode = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.status = 'anonymous';
        state.user = null;
        state.pendingVerificationEmail = action.payload?.email || action.payload?.user?.email || null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.status = 'anonymous';
        state.error = action.payload;
        state.errorCode = null;
      })
      .addCase(verifyEmailUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
        state.errorCode = null;
      })
      .addCase(verifyEmailUser.fulfilled, (state, action) => {
        state.status = 'authenticated';
        state.user = action.payload;
        state.pendingVerificationEmail = null;
        state.errorCode = null;
      })
      .addCase(verifyEmailUser.rejected, (state, action) => {
        state.status = 'anonymous';
        state.user = null;
        state.error = action.payload;
        state.errorCode = null;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.status = 'anonymous';
        state.user = null;
        state.errorCode = null;
      });
  },
});

export const { clearAuthError, setCurrentUser } = authSlice.actions;
export default authSlice.reducer;
