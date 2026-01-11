import { createSlice } from "@reduxjs/toolkit";
import { getAllPosts, createPost, deletePost, getComments, addComment } from "../../action/postAction/index.js";

const initialState = {
  posts: [],
  isError: false,
  postFetch: false,
  isLoading: false,
  message: "",
  comments: [],
  postId: "",
  postCreated: false,
};

const postSlice = createSlice({
  name: "post",
  initialState,

  reducers: {
    reset: () => initialState,
    resetPostId: (state) => {
      state.postId = "";
    },
    resetPostCreated: (state) => {
      state.postCreated = false;
    }
  },

  extraReducers: (builder) => {
    builder
      // GET ALL POSTS
      .addCase(getAllPosts.pending, (state) => {
        state.isLoading = true;
        state.postFetch = false;
        state.isError = false;
        state.message = "fetching all posts...";
      })
      .addCase(getAllPosts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.postFetch = true;
        state.isError = false;
        state.posts = action.payload.posts || [];
        state.message = "Posts fetched successfully";
      })
      .addCase(getAllPosts.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.postFetch = false;
        state.message = action.payload || "Failed to fetch posts";
      })

      // CREATE POST
      .addCase(createPost.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.postCreated = false;
        state.message = "Creating post...";
      })
      .addCase(createPost.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isError = false;
        state.postCreated = true;
        state.message = "Post created successfully";
        // Optionally add the new post to the beginning of the array
        if (action.payload.post) {
          state.posts = [action.payload.post, ...state.posts];
        }
      })
      .addCase(createPost.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.postCreated = false;
        state.message = action.payload || "Failed to create post";
      })

      // DELETE POST
      .addCase(deletePost.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.message = "Deleting post...";
      })
      .addCase(deletePost.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isError = false;
        state.message = "Post deleted successfully";
        // Remove the deleted post from the posts array
        state.posts = state.posts.filter(post => post._id !== action.meta.arg);
      })
      .addCase(deletePost.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload || "Failed to delete post";
      })
      
      // GET COMMENTS
      .addCase(getComments.fulfilled, (state, action) => {
        state.postId = action.payload.postId;
        state.comments = action.payload.comments;
      })
      
      // ADD COMMENT
      .addCase(addComment.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.message = "Adding comment...";
      })
      .addCase(addComment.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isError = false;
        state.message = "Comment added successfully";
      })
      .addCase(addComment.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload || "Failed to add comment";
      })
  }
});

export const { reset, resetPostId, resetPostCreated } = postSlice.actions;
export default postSlice.reducer;