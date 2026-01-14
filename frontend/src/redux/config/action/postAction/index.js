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

// Upload image to Cloudinary
export const uploadPostImage = createAsyncThunk(
  "posts/uploadPostImage",
  async (file, thunkAPI) => {
    try {
      const token = localStorage.getItem("token");
      
      if (!token) {
        return thunkAPI.rejectWithValue("No token available");
      }

      const formData = new FormData();
      formData.append('image', file);

      const response = await clientServer.post("/api/upload/post-image", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to upload image"
      );
    }
  }
);

export const createPost = createAsyncThunk(
  "posts/createPost",
  async (postData, thunkAPI) => {
    try {
      const { file, body } = postData;
      let mediaUrl = null;

      // If there's a file, upload to Cloudinary first
      if (file) {
        const uploadResult = await thunkAPI.dispatch(uploadPostImage(file)).unwrap();
        mediaUrl = uploadResult.url;
      }

      // Create post with Cloudinary URL
      const response = await clientServer.post("/post", {
        body: body,
        media: mediaUrl
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
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
