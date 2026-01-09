import Profile from "../models/profile.model.js";
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
    // Allow posts with either text body OR media (or both)
    if (!req.body.body && !req.file) {
      return res.status(400).json({ message: "Post must contain text or media" });
    }
    const profile = await Profile.findOne({ userId: user._id });
    if (!profile) {
      return res.status(400).json({ message: "Profile not found" });
    }
    const post = new Post({
      userId: user._id,
      body: req.body.body || "",
      media: req.file != undefined ? req.file.filename : "",
      fileType: req.file != undefined ? req.file.mimetype.split("/")[0] : "",
    });
    await post.save();
    return res.status(201).json({ message: "Post created successfully", post });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server Error", error: error.message });
  }
};

//  |----------------------------------------------------------------------|
//  |                       get all posts                                  |
//  |----------------------------------------------------------------------|

export const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("userId", "name username email profilePicture")
      .sort({ createdAt: -1 }); // Sort by newest first
    
    console.log("Fetched posts:", posts?.length || 0);
    return res.status(200).json({ posts: posts || [] });
  } catch (error) {
    console.error("Error fetching posts:", error);
    return res.status(500).json({ message: "Server Error", error: error.message });
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
    
    // FIXED: Changed from req.body.comment to req.body.body to match the model
    const comment = new Comment({
      userId: user._id,
      postId: postId,
      body: req.body.body || req.body.comment, // Support both for backwards compatibility
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
    const comments = await Comment.find({ postId: postId }).populate(
      "userId",
      "name username email profilePicture"
    );
    
    if (!comments || comments.length === 0) {
      return res
        .status(200)
        .json({ message: "No comments found for this post", comments: [] });
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
//  |                       increment like                                 |
//  |----------------------------------------------------------------------|
export const likePost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id || req.user.id;

    const post = await Post.findById(id);
    
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Initialize likedBy array if it doesn't exist
    if (!post.likedBy) {
      post.likedBy = [];
    }

    // Check if user already liked the post
    const hasLiked = post.likedBy.some(id => id.toString() === userId.toString());
    
    if (hasLiked) {
      // Unlike the post
      post.likes = Math.max(0, post.likes - 1);
      post.likedBy = post.likedBy.filter(id => id.toString() !== userId.toString());
      await post.save();
      return res.status(200).json({ 
        message: "Post unliked", 
        post, 
        liked: false 
      });
    } else {
      // Like the post
      post.likes = (post.likes || 0) + 1;
      post.likedBy.push(userId);
      await post.save();
      return res.status(200).json({ 
        message: "Post liked", 
        post, 
        liked: true 
      });
    }
  } catch (error) {
    console.error("Error in likePost:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};