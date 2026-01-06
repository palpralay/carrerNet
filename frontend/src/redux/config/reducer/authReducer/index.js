import { createSlice } from "@reduxjs/toolkit";
import { loginUser, registerUser } from "../../action/authAction/index.js";

const initialState = {
  user: {},
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

    handleLoginUser: (state) => {
      state.message = "hello";
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
        state.token = action.payload.token || action.payload;
        state.user = action.payload.user || action.payload;
        state.message = "Login successful";
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.isSuccess = false;
        state.loggedIn = false;
        state.token = null;
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
        state.token = action.payload.token || action.payload;
        state.user = action.payload.user || action.payload;
        state.message = "Registration successful";
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.isSuccess = false;
        state.loggedIn = false;
        state.message = action.payload || "Registration failed";
      });
  },
});

export const { reset, clearAuth, handleLoginUser } = authSlice.actions;
export default authSlice.reducer;