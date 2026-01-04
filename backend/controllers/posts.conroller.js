import Profile from "../models/profile.model.js";
import User from "../models/user.model.js";
import Post from "../models/post.model.js";
import Comment from "../models/comments.model.js";

const activeCheck = async (req, res, next) => {
  return res.status(200).json({ message: "User is active" });
};
export { activeCheck };

//  |----------------------------------------------------------------------|
//  |                        create post                                   |
//  |----------------------------------------------------------------------|
export const createPost = async (req, res) => {
  const user = req.user;
  console.log("req.body:", req.body);
  console.log("req.file:", req.file);
  try {
    if (!req.body.body) {
      return res.status(400).json({ message: "Post body is required" });
    }
    const profile = await Profile.findOne({ userId: user._id });
    if (!profile) {
      return res.status(400).json({ message: "Profile not found" });
    }
    const post = new Post({
      userId: user._id,
      body: req.body.body,
      media: req.file != undefined ? req.file.filename : "",
      fileType: req.file != undefined ? req.file.mimetype.split("/")[0] : "",
    });
    await post.save();
    return res.status(201).json({ message: "Post created successfully", post });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server Error" });
  }
};

//  |----------------------------------------------------------------------|
//  |                       get all posts                                  |
//  |----------------------------------------------------------------------|

export const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find().populate(
      "userId",
      "name username email profilePicture"
    );
    console.log(posts);
    return res.status(200).json({ posts });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server Error" });
  }
};

//  |----------------------------------------------------------------------|
//  |                       delete posts                                   |
//  |----------------------------------------------------------------------|
export const deletePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const user = req.user;
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    if (post.userId.toString() !== user._id.toString()) {
      return res.status(403).json({ message: "Forbidden" });
    }
    await Post.findByIdAndDelete(postId);
    return res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Server Error" });
  }
};

//  |----------------------------------------------------------------------|
//  |                       comment posts                                  |
//  |----------------------------------------------------------------------|
export const commentOnPost = async (req, res) => {
  try {
    const user = req.user;
    const profile = await Profile.findOne({ userId: user._id });
    if (!profile) {
      return res.status(400).json({ message: "Profile not found" });
    }
    const postId = req.params.id;
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(400).json({ message: "Post not found" });
    }
    const comment = new Comment({
      userId: user._id,
      postId: postId,
      comment: req.body.comment,
    });

    console.log("comment:", comment);
    await comment.save();
    return res
      .status(201)
      .json({ message: "Comment added successfully", comment });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server Error" });
  }
};

//  |----------------------------------------------------------------------|
//  |                      get comments by posts                           |
//  |----------------------------------------------------------------------|

export const getCommentsByPost = async (req, res) => {
  try {
    const postId = req.params.id;
    const comments = await Comment.find({ postId: postId });
    if (!comments) {
      return res
        .status(400)
        .json({ message: "No comments found for this post" });
    }
    return res.status(200).json({ comments });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server Error" });
  }
};

//  |----------------------------------------------------------------------|
//  |                      delete comment posts                            |
//  |----------------------------------------------------------------------|
export const deleteComment = async (req, res) => {
  try {
    const user = req.user;
    const postId = req.params.postId;
    const commentId = req.params.id;
    const comment = await Comment.findById(commentId);
    if (!user || !comment) {
      return res.status(400).json({ message: "Comment or User not found" });
    }
    if (comment.userId.toString() !== user._id.toString()) {
      return res.status(403).json({ message: "Forbidden" });
    }
    await Comment.findByIdAndDelete(commentId);
    return res.status(200).json({ message: "Comment deleted successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server Error" });
  }
};

//  |----------------------------------------------------------------------|
//  |                       incriment like                                 |
//  |----------------------------------------------------------------------|
export const likePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    post.likes += 1;
    await post.save();
    return res.status(200).json({ message: "Post liked", likes: post.likes });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server Error" });
  }
};
