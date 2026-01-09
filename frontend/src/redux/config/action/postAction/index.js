import { createAsyncThunk } from "@reduxjs/toolkit";
import { BASE_URL, clientServer } from "../../index";
import { comment } from "postcss/lib/postcss";

export const getAllPosts = createAsyncThunk(
  "posts/getAllPosts",
  async (_, thunkAPI) => {
    try {
      const state = thunkAPI.getState();
      const token = state.auth?.token || localStorage.getItem("token");

      const response = await fetch(`${BASE_URL}/posts`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      // Check if response is JSON
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        console.error("Response is not JSON:", await response.text());
        return thunkAPI.rejectWithValue("Server returned non-JSON response");
      }

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
      console.error("Error in getAllPosts:", error);
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

      const response = await fetch(`${BASE_URL}/post`, {
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

export const deletePost = createAsyncThunk(
  "posts/deletePost",
  async (postId, thunkAPI) => {
    try {
      const state = thunkAPI.getState();
      const token = state.auth?.token || localStorage.getItem("token");
      const response = await fetch(`${BASE_URL}/delete/${postId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        return thunkAPI.rejectWithValue(
          errorData.message || "Failed to delete post"
        );
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error in deletePost:", error);
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

export const incrimentLike = createAsyncThunk(
  "posts/incrimentLike",
  async (postId, thunkAPI) => {
    try {
      const state = thunkAPI.getState();
      const token = state.auth?.token || localStorage.getItem("token");
      const response = await clientServer.get(`/post_like/${postId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error in incrimentLike:", error);
      if (error.response) {
        console.error("Response status:", error.response.status);
        console.error("Response data:", error.response.data);
        return thunkAPI.rejectWithValue(
          error.response.data?.message || error.message
        );
      }
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

export const getComments = createAsyncThunk(
  "posts/getComments",
  async (postId, thunkAPI) => {
    try {
      const state = thunkAPI.getState();
      const token = state.auth?.token || localStorage.getItem("token");
      const response = await clientServer.get(`/get_comment/${postId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return thunkAPI.fulfillWithValue({
        comments: response.data.comments,
        postId: postId,
      });
    } catch (error) {
      console.error("Error in getComments:", error);
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

export const addComment = createAsyncThunk(
  "posts/addComment",
  async ({ postId, commentText }, thunkAPI) => {
    try {
      console.log(
        "Adding comment to postId:",
        postId,
        "with text:",
        commentText
      );
      const state = thunkAPI.getState();
      const token = state.auth?.token || localStorage.getItem("token");
      const response = await clientServer.post(
        `/comment/${postId}`,
        { body: commentText },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return thunkAPI.fulfillWithValue(response.data);
    } catch (error) {
      console.error("Error in addComment:", error);
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);
