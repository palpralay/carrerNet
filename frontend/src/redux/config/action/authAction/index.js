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

export const getAboutUser = createAsyncThunk(
  "user/getAboutUser",
  async (user, thunkAPI) => {
    try {
      const response = await clientServer.get("/get_user_and_profile",{
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      
      return thunkAPI.fulfillWithValue(response.data);
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || "Failed to fetch user data");
    }
  });


  export const getAllUsers = createAsyncThunk(
  "user/getAllUserProfiles",
  async (_, thunkAPI) => {
      try {
        const response = await clientServer.get("/user/get_all_users", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        console.log('getAllUsers API response:', response.data);
        return response.data;
      } catch (error) {
        console.log('getAllUsers API error:', error.response?.data);
        return thunkAPI.rejectWithValue(
          error.response?.data?.message || "Failed to fetch all user profiles"
        );
        
      }
  }

  )






export const logoutUser = createAsyncThunk(
  "user/logout",
  async (_, thunkAPI) => {
    try {
      const state = thunkAPI.getState();
      const token = state.auth?.token || localStorage.getItem("token");

      if (token) {
        await clientServer.post("/logout", {}, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }

      // Clear token from localStorage regardless of API call success
      localStorage.removeItem("token");
      return { message: "Logged out successfully" };
    } catch (error) {
      // Clear token even if API call fails
      localStorage.removeItem("token");
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Logout failed"
      );
    }
  }
);

export default clientServer;
