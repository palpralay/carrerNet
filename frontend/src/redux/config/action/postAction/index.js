import { createAsyncThunk } from "@reduxjs/toolkit";

export const getAllPosts = createAsyncThunk(
  "posts/getAllPosts",
  async (_, thunkAPI) => {
    try {
      const state = thunkAPI.getState();
      const token = state.auth?.token || localStorage.getItem("token");

      const response = await fetch("http://localhost:9000/posts", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();

        if (
          response.status === 401 &&
          errorData.message === "Invalid or expired token"
        ) {
          localStorage.removeItem("token");

          return thunkAPI.rejectWithValue({
            message: errorData.message,
            requiresReauth: true,
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

export const createPost = createAsyncThunk(
  "posts/createPost",
  async (postData, thunkAPI) => {
    try {
      const state = thunkAPI.getState();
      const token = state.auth?.token || localStorage.getItem("token");

      const { file, body } = postData;
      const formData = new FormData();
      formData.append("media", file);
      formData.append("body", body);

      const response = await fetch("http://localhost:9000/post", {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        return thunkAPI.rejectWithValue(
          errorData.message || "Failed to create post"
        );
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);
