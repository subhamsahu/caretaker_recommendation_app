import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { loginUser as apiLogin, registerUser as apiRegister } from '@/api/client'

// Initial state
const initialState = {
  user: null as { email: string } | null,
  token: localStorage.getItem('token'),
  isLoading: false,
  error: null as string | null,
  isAuthenticated: !!localStorage.getItem('token'),
}

// Login thunk — calls KidCare backend
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const data = await apiLogin(credentials.email, credentials.password)
      localStorage.setItem('token', data.access_token)
      return { token: data.access_token, email: credentials.email }
    } catch (error: any) {
      const msg = error.response?.data?.detail || 'Login failed'
      return rejectWithValue(msg)
    }
  }
)

// Register thunk — calls KidCare backend
export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (
    credentials: { email: string; username: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      const data = await apiRegister(
        credentials.email,
        credentials.username,
        credentials.password
      )
      localStorage.setItem('token', data.access_token)
      return { token: data.access_token, email: credentials.email }
    } catch (error: any) {
      const msg = error.response?.data?.detail || 'Registration failed'
      return rejectWithValue(msg)
    }
  }
)

export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async () => {
    localStorage.removeItem('token')
    return null
  }
)

// Auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    logout: (state) => {
      state.user = null
      state.token = null
      state.isAuthenticated = false
      localStorage.removeItem('token')
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = { email: action.payload.email }
        state.token = action.payload.token
        state.isAuthenticated = true
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false
        state.error = String(action.payload || 'Login failed')
      })

    // Register
    builder
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = { email: action.payload.email }
        state.token = action.payload.token
        state.isAuthenticated = true
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false
        state.error = String(action.payload || 'Registration failed')
      })

    // Logout
    builder.addCase(logoutUser.fulfilled, (state) => {
      state.user = null
      state.token = null
      state.isAuthenticated = false
    })
  },
})

export const { clearError, logout } = authSlice.actions
export default authSlice.reducer