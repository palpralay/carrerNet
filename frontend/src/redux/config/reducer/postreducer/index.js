import { createSlice } from "@reduxjs/toolkit";
import { getAllPosts } from "../../action/postAction/index.js";

const initialState = {
  posts: [],
  isError:false,
  postFetch:false,
  isLoading:false,
  message:"",
  comment:[],
  postId:"",
};

const postSlice = createSlice({
  name: "post",
  initialState,

  reducers: {
    reset: () => initialState,
    resetPostId: (state) => {
      state.postId = "";
    }
  },

  extraReducers: (builder) => {
    builder
      .addCase(getAllPosts.pending, (state) => {
        state.isLoading = true;
        state.postFetch = false;
        state.message = "fetching all posts...";
      })
      .addCase(getAllPosts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.postFetch = true;
        state.postFetch = true;
        state.posts = action.payload.posts;
      })
      .addCase(getAllPosts.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { reset, resetPostId } = postSlice.actions;
export default postSlice.reducer;
