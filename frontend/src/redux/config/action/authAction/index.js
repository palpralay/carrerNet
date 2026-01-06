import { createAsyncThunk } from "@reduxjs/toolkit";
import { clientServer } from "@/redux/config/index.jsx";

export const loginUser = createAsyncThunk(
  "user/login",
  async (user, thunkAPI) => {
    try {
      const response = await clientServer.post("/login", {
        email: user.email,
        password: user.password,
      });

      const token = response.data?.token;

      if (!token) {
        return thunkAPI.rejectWithValue("No token received");
      }

      localStorage.setItem("token", token);
      return response.data; // Return full response
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Login failed"
      );
    }
  }
);

export const registerUser = createAsyncThunk(
  "user/register",
  async (user, thunkAPI) => {
    try {
      const response = await clientServer.post("/register", {
        username: user.username,
        name: user.name,
        email: user.email,
        password: user.password,
      });

      // Store token after successful registration
      const token = response.data?.token;
      if (token) {
        localStorage.setItem("token", token);
      }

      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Registration failed"
      );
    }
  }
);

export default clientServer;
