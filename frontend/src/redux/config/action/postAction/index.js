import { createAsyncThunk } from "@reduxjs/toolkit";
import { clientServer } from "../../index";

export const getAllPosts = createAsyncThunk(
  "posts/getAllPosts",
  async (_, thunkAPI) => {
    try {
      const response = await clientServer.get("/posts");
      return response.data;
    } catch (error) {
      console.error("Error in getAllPosts:", error);
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch posts"
      );
    }
  }
);

export const createPost = createAsyncThunk(
  "posts/createPost",
  async (postData, thunkAPI) => {
    try {
      const { file, body } = postData;
      const formData = new FormData();
      if (file) formData.append("media", file);
      if (body) formData.append("body", body);

      const response = await clientServer.post("/post", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to create post"
      );
    }
  }
);

export const deletePost = createAsyncThunk(
  "posts/deletePost",
  async (postId, thunkAPI) => {
    try {
      const response = await clientServer.delete(`/delete/${postId}`);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to delete post"
      );
    }
  }
);

export const incrementLike = createAsyncThunk(
  "posts/incrementLike",
  async (postId, thunkAPI) => {
    try {
      const response = await clientServer.get(`/post_like/${postId}`);
      return response.data;
    } catch (error) {
      console.error("Error in incrementLike:", error);
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to like post"
      );
    }
  }
);

export const getComments = createAsyncThunk(
  "posts/getComments",
  async (postId, thunkAPI) => {
    try {
      const response = await clientServer.get(`/get_comment/${postId}`);
      // Handle response structure { comments: [...] }
      const comments = response.data.comments || response.data || [];
      
      return thunkAPI.fulfillWithValue({
        comments: comments,
        postId: postId,
      });
    } catch (error) {
      console.error("Error in getComments:", error);
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to get comments"
      );
    }
  }
);

export const addComment = createAsyncThunk(
  "posts/addComment",
  async ({ postId, commentText }, thunkAPI) => {
    try {
      const response = await clientServer.post(`/comment/${postId}`, { 
        body: commentText 
      });
      return thunkAPI.fulfillWithValue(response.data);
    } catch (error) {
      console.error("Error in addComment:", error);
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to add comment"
      );
    }
  }
);

export const deleteComment = createAsyncThunk(
  "posts/deleteComment",
  async ({ postId, commentId }, thunkAPI) => {
    try {
      const response = await clientServer.delete(
        `/delete_comment/${postId}/${commentId}`
      );
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to delete comment"
      );
    }
  }
);
