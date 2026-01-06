import { createSlice } from "@reduxjs/toolkit";
import { loginUser, registerUser, logoutUser, getAboutUser } from "../../action/authAction/index.js";

const initialState = {
  user: {},
  profile: {},
  token: null,
  loggedIn: false,
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: "",
  profileFetched: false,
  connection: [],
  connectionRequest: [],
};

const authSlice = createSlice({
  name: "auth",
  initialState,

  reducers: {
    reset: (state) => {
      state.isError = false;
      state.isSuccess = false;
      state.isLoading = false;
      state.message = "";
    },

    clearAuth: () => initialState,

    setAuthFromStorage: (state, action) => {
      // For loading auth from localStorage on mount
      state.token = action.payload.token;
      state.loggedIn = true;
    },
  },

  extraReducers: (builder) => {
    builder
      // LOGIN
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.isSuccess = false;
        state.message = "Loading...";
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.isError = false;
        state.loggedIn = true;
        state.token = action.payload.token;
        state.user = action.payload.user || {};
        state.message = "Login successful";
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.isSuccess = false;
        state.loggedIn = false;
        state.token = null;
        state.user = {};
        state.message = action.payload || "Login failed";
      })

      // REGISTER - AUTO LOGIN
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.isSuccess = false;
        state.message = "Registering...";
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.isError = false;
        state.loggedIn = true;
        state.token = action.payload.token;
        state.user = action.payload.user || {};
        state.message = "Registration successful";
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.isSuccess = false;
        state.loggedIn = false;
        state.token = null;
        state.message = action.payload || "Registration failed";
      })

      // GET ABOUT USER (Fetch full profile)
      .addCase(getAboutUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getAboutUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.profileFetched = true;
        state.user = action.payload.user || state.user;
        state.profile = action.payload.profile || {};
        state.isError = false;
      })
      .addCase(getAboutUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.profileFetched = false;
        state.message = action.payload || "Failed to fetch user data";
      })

      // LOGOUT
      .addCase(logoutUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logoutUser.fulfilled, () => {
        // Reset to initial state on logout
        return initialState;
      })
      .addCase(logoutUser.rejected, () => {
        // Even if logout fails, clear the auth state
        return initialState;
      });
  },
});

export const { reset, clearAuth, setAuthFromStorage } = authSlice.actions;
export default authSlice.reducer;