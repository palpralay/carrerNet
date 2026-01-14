"use client";

import DashboardLayout from "@/layouts/dashboardLayout";
import UserLayout from "@/layouts/UserLayout";
import { BASE_URL } from "@/redux/config";
import { getAboutUser, getAllUsers } from "@/redux/config/action/authAction";
import {
  addComment,
  createPost,
  deletePost,
  getAllPosts,
  getComments,
  incrementLike,
} from "@/redux/config/action/postAction";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "sonner";

const Dashboard = () => {
  const authState = useSelector((state) => state.auth);
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const dispatch = useDispatch();
  const [postContent, setPostContent] = useState("");
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const postState = useSelector((state) => state.posts);
  const [likingPosts, setLikingPosts] = useState(new Set());
  const [commentsVisibleForPost, setCommentsVisibleForPost] = useState(null);
  const [comment, setComment] = useState("");

  // Initial load - data fetching
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.replace("/login");
      return;
    }

    setIsChecking(false);

    dispatch(getAllPosts());

    if (!authState.all_profile_fetched) {
      dispatch(getAllUsers());
    }

    if (!authState.loggedIn || !authState.profileFetched) {
      dispatch(getAboutUser({ token }));
    }
  }, []);

  useEffect(() => {
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setFilePreview(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    } else {
      setFilePreview(null);
    }
  }, [file]);

  // Show loading state
  if (isChecking || (authState.isLoading && !authState.user?.name)) {
    return (
      <UserLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-lg">Loading...</div>
        </div>
      </UserLayout>
    );
  }

  const handlePostSubmit = async (e) => {
    e.preventDefault();

    if (!postContent.trim() && !file) {
      toast.error("Please add some content or a photo");
      return;
    }

    try {
      const result = await dispatch(
        createPost({ file: file, body: postContent })
      );

      if (result.error) {
        toast.error("Failed to create post");
        console.error("Post creation error:", result.error);
        return;
      }

      // Clear form
      setPostContent("");
      setFile(null);
      setFilePreview(null);

      toast.success("Post created successfully!");

      // Refresh posts list
      setTimeout(() => {
        dispatch(getAllPosts());
      }, 300);
    } catch (error) {
      console.error("Error creating post:", error);
      toast.error("Failed to create post");
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.size > 5 * 1024 * 1024) {
        toast.error("File size should be less than 5MB");
        return;
      }
      setFile(selectedFile);
    }
  };

  const removeFile = () => {
    setFile(null);
    setFilePreview(null);
  };

  const handleDeletePost = async (postId) => {
    try {
      const result = await dispatch(deletePost(postId));

      if (result.error) {
        toast.error(result.payload || "Failed to delete post");
        console.error("Delete error:", result.error);
      } else {
        toast.success("Post deleted successfully!");
      }
    } catch (error) {
      console.error("Error deleting post:", error);
      toast.error("Failed to delete post");
    }
  };

  const handleSharePost = async (post) => {
    const shareUrl = `${window.location.origin}/post/${post._id}`;
    const shareText = `Check out this post by ${
      post.userId?.name || "Unknown User"
    }`;

    // Check if Web Share API is supported (mobile devices)
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareText,
          text: post.body || "",
          url: shareUrl,
        });
        toast.success("Post shared successfully!");
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Error sharing:", error);
        }
      }
    } else {
      // Fallback for desktop: Copy to clipboard
      try {
        await navigator.clipboard.writeText(shareUrl);
        toast.success("Link copied to clipboard!");
      } catch (error) {
        console.error("Error copying to clipboard:", error);
        toast.error("Failed to copy link");
      }
    }
  };

  return (
    <UserLayout>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Create Post Card */}
          <div className="bg-white rounded-xl shadow-md border border-gray-400 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Create a post
            </h2>

            <div className="flex gap-4">
              {/* Profile Image */}
              <Image
                onClick={() => {
                  router.push(`/viewProfile/${authState.user.username}`);
                }}
                className="h-12 w-12 rounded-full cursor-pointer object-cover shrink-0"
                src={
                  authState.user?.profilePicture &&
                  authState.user.profilePicture !== "default.jpg"
                    ? `${BASE_URL}/${authState.user.profilePicture}`
                    : "/images/avatar.png"
                }
                alt="profile"
                onError={(e) => {
                  e.target.src = "/images/avatar.png";
                }}
                width={64}
                height={64}
              />

              {/* Input Area */}
              <div className="flex-1">
                <textarea
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  name="status"
                  id="status"
                  placeholder="What's on your mind?"
                  className="w-full resize-none min-h-25 p-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                ></textarea>

                {/* File Preview */}
                {filePreview && (
                  <div className="mt-3 relative inline-block">
                    <Image
                      src={filePreview}
                      alt="Preview"
                      className="max-h-40 rounded-lg border border-gray-300"
                      width={160}
                      height={160}
                    />
                    <button
                      onClick={() => {
                        removeFile();
                        router.dispatch(getAllPosts());
                      }}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        className="w-4 h-4"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                )}

                {/* Action Row */}
                <div className="flex justify-between items-center mt-4">
                  <label
                    htmlFor="fileInput"
                    className="flex items-center gap-2 cursor-pointer text-gray-600 hover:text-indigo-600 transition"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="h-6 w-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
                      />
                    </svg>
                    <span className="text-sm font-medium">Add photo</span>
                    <input
                      onChange={handleFileChange}
                      type="file"
                      id="fileInput"
                      accept="image/*"
                      className="hidden"
                    />
                  </label>

                  <button
                    onClick={handlePostSubmit}
                    disabled={postState.isLoading}
                    className="bg-indigo-600 cursor-pointer hover:bg-indigo-700 text-white px-6 py-2 rounded-full text-sm font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {postState.isLoading ? "Posting..." : "Post"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Posts Feed */}
          <div className="space-y-4">
            {postState.isLoading && !postState.posts?.length ? (
              <div className="bg-white rounded-xl shadow-md border border-gray-200 p-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                <p className="text-gray-500 mt-4">Loading posts...</p>
              </div>
            ) : !postState.posts || postState.posts.length === 0 ? (
              <div className="bg-white rounded-xl shadow-md border border-gray-200 p-8 text-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-16 h-16 mx-auto text-gray-400 mb-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
                  />
                </svg>
                <p className="text-gray-500 text-lg font-medium">
                  No posts yet
                </p>
                <p className="text-gray-400 text-sm mt-2">
                  Be the first to share something!
                </p>
              </div>
            ) : (
              postState.posts.map((post) => (
                <div
                  key={post._id}
                  className="bg-white rounded-xl shadow-md border border-gray-200 p-6"
                >
                  {/* Post Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <Image
                        onClick={() => {
                          router.push(
                            `/viewProfile/${authState.user.username}`
                          );
                        }}
                        src={
                          post.userId?.profilePicture &&
                          post.userId.profilePicture !== "default.jpg"
                            ? `${BASE_URL}/${post.userId.profilePicture}`
                            : "/images/avatar.png"
                        }
                        alt="Author"
                        className="h-12 w-12 rounded-full cursor-pointer object-cover"
                        onError={(e) => {
                          e.target.src = "/images/avatar.png";
                        }}
                        width={48}
                        height={48}
                      />
                      <div className="ml-3">
                        <p className="font-semibold text-gray-900">
                          {post.userId?.name || "Unknown User"}
                        </p>
                        <p className="text-gray-400">
                          @{post.userId?.username || "unknown"}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(post.createdAt).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            }
                          )}
                        </p>
                      </div>
                    </div>
                    {authState.user?._id === post.userId?._id && (
                      <div
                        onClick={() => {
                          handleDeletePost(post._id);
                          dispatch(getAllPosts());
                        }}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="size-6 cursor-pointer text-gray-500 hover:text-red-500 transition flex-shrink-0"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                          />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Post Content */}
                  {post.body && (
                    <p className="text-gray-800 mb-4 whitespace-pre-wrap">
                      {post.body}
                    </p>
                  )}

                  {/* Post Media */}
                  {post.media && (
                    <Image
                      src={`${BASE_URL}/uploads/${post.media}`}
                      alt="Post content"
                      className="w-full object-cover h-96 rounded-lg border border-gray-200"
                      unoptimized={true}
                      onError={(e) => {
                        console.error('Image load error for:', `${BASE_URL}/uploads/${post.media}`);
                        e.target.style.display = "none";
                      }}
                      width={640}
                      height={640}
                    />
                  )}

                  <div className="flex justify-around items-center relative gap-10 text-gray-500 mt-4">
                    <div
                      onClick={async () => {
                        // Prevent multiple clicks on same post
                        if (likingPosts.has(post._id)) {
                          toast.info("Processing like...");
                          return;
                        }

                        setLikingPosts((prev) => new Set(prev).add(post._id));

                        try {
                          const result = await dispatch(
                            incrementLike(post._id)
                          );

                          if (result.error) {
                            toast.error(
                              result.payload || "Failed to like post"
                            );
                            console.error("Like error:", result.error);
                          } else {
                            // Update local state is handled by reducer now,
                            // but we still refresh to be safe or if multiple users are active
                            // Optimistic update in reducer is better though
                          }
                        } catch (error) {
                          console.error("Error liking post:", error);
                          toast.error("Failed to like post");
                        } finally {
                          setLikingPosts((prev) => {
                            const newSet = new Set(prev);
                            newSet.delete(post._id);
                            return newSet;
                          });
                        }
                      }}
                      className="flex items-center gap-2"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="size-8 flex cursor-pointer hover:text-indigo-600 transition"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M6.633 10.25c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 0 1 2.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 0 0 .322-1.672V2.75a.75.75 0 0 1 .75-.75 2.25 2.25 0 0 1 2.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282m0 0h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 0 1-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 0 0-1.423-.23H5.904m10.598-9.75H14.25M5.904 18.5c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 0 1-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 9.953 4.167 9.5 5 9.5h1.053c.472 0 .745.556.5.96a8.958 8.958 0 0 0-1.302 4.665c0 1.194.232 2.333.654 3.375Z"
                        />
                      </svg>
                      <p className="text-xl">{post.likes}</p>
                    </div>

                    <div
                      onClick={() => {
                        console.log("Opening comments for post:", post._id);
                        setCommentsVisibleForPost(post._id);
                        dispatch(getComments(post._id)).then((result) => {
                          console.log("Comments fetched:", result);
                          console.log("Comments payload:", result.payload);
                        });
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="size-8 cursor-pointer hover:text-indigo-600 transition"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 0 1-.923 1.785A5.969 5.969 0 0 0 6 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337Z"
                        />
                      </svg>
                    </div>
                    <div onClick={() => handleSharePost(post)}>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                        stroke="currentColor"
                        className="size-8 cursor-pointer hover:text-indigo-600 transition"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        {commentsVisibleForPost && (
          <div
            onClick={() => {
              setCommentsVisibleForPost(null);
            }}
            className="fixed inset-0 w-screen h-screen z-[60] 
                bg-black/70 overflow-hidden
                flex items-center justify-center"
          >
            <div
              className="w-[500px] h-[500px] rounded-2xl bg-white flex flex-col overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Comments Header */}
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800">
                  Comments
                </h2>
              </div>

              {/* Comments List - Scrollable */}
              <div className="flex-1 overflow-y-auto px-6 py-4">
                {!postState.comments || postState.comments.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-500 text-sm md:text-base">
                      No comments yet. Be the first to comment!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {postState.comments.map((postComment, index) => (
                      <div
                        key={index}
                        className="flex gap-3 pb-4 border-b border-gray-100 last:border-0"
                      >
                        <Image
                          src={
                            postComment.userId?.profilePicture &&
                            postComment.userId.profilePicture !== "default.jpg"
                              ? `${BASE_URL}/${postComment.userId.profilePicture}`
                              : "/images/avatar.png"
                          }
                          alt="Commenter"
                          className="h-8 w-8 rounded-full object-cover flex-shrink-0"
                          onError={(e) => {
                            e.target.src = "/images/avatar.png";
                          }}
                          width={32}
                          height={32}
                        />
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900 text-sm">
                            {postComment.userId?.name || "Unknown User"}
                          </p>
                          <p className="text-gray-700 text-sm mt-1">
                            {postComment.body}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Input Section - Fixed at Bottom */}
              <div className="border-t border-gray-200 px-4 py-3 bg-gray-50">
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    placeholder="Add a comment..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="flex-1 h-12 px-4 rounded-full bg-white border border-gray-300
                      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    onClick={async () => {
                      if (!comment.trim()) {
                        toast.error("Please enter a comment");
                        return;
                      }

                      console.log(
                        "Adding comment to postId:",
                        commentsVisibleForPost,
                        "with text:",
                        comment
                      );

                      const addResult = await dispatch(
                        addComment({
                          postId: commentsVisibleForPost,
                          commentText: comment,
                        })
                      );

                      console.log("Add comment result:", addResult);

                      setComment("");

                      const commentsResult = await dispatch(
                        getComments(commentsVisibleForPost)
                      );
                      console.log("Get comments result:", commentsResult);
                      console.log(
                        "Current postState.comments:",
                        postState.comments
                      );
                    }}
                    className="bg-blue-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-full 
                      text-sm font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed
                      shrink-0"
                  >
                    Post
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </DashboardLayout>
    </UserLayout>
  );
};

export default Dashboard;
