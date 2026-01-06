import { createAsyncThunk } from "@reduxjs/toolkit";

export const getAllPosts = createAsyncThunk(
  "posts/getAllPosts",
  async (_, thunkAPI) => {
    try {
      const state = thunkAPI.getState();
      const token =
        state.auth?.token || localStorage.getItem("token");

      const response = await fetch("http://localhost:9000/posts", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        
        // Handle token expiration
        if (response.status === 401 && errorData.message === "Invalid or expired token") {
          // Clear invalid token
          localStorage.removeItem("token");
          // Optionally dispatch a logout action
          return thunkAPI.rejectWithValue({
            message: errorData.message,
            requiresReauth: true
          });
        }
        
        return thunkAPI.rejectWithValue(
          errorData.message || "Failed to fetch posts"
        );
      }

      const data = await response.json();
      return data; 
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);
