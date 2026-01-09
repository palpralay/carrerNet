"use client";

import DashboardLayout from "@/layouts/dashboardLayout";
import UserLayout from "@/layouts/UserLayout";
import { BASE_URL } from "@/redux/config";
import { getAboutUser, getAllUsers } from "@/redux/config/action/authAction";
import { createPost, getAllPosts } from "@/redux/config/action/postAction";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";

const Dashboard = () => {
  const router = useRouter();
  const authState = useSelector((state) => state.auth);
  const [isChecking, setIsChecking] = useState(true);
  const dispatch = useDispatch();
  const [postContent, setPostContent] = useState("");
  const [file, setFile] = useState();
  const postState = useSelector((state) => state.posts);

  // useEffect(()=>{
  //   if(postState.postCreated){
  //     dispatch(getAllPosts());
  //   }
  // },[postState.postCreated, dispatch])

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
    } else {
      setIsChecking(false);

      if (!authState.profileFetched) {
        dispatch(getAboutUser({ token }));
      }

      dispatch(getAllPosts());
      if (!authState.all_profile_fetched) {
        dispatch(getAllUsers());
      }
    }
  }, [dispatch, router, authState.profileFetched]);

  if (isChecking || (authState.isLoading && !authState.user?.name)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    await dispatch(createPost({ file: file, body: postContent }));
    setPostContent("");
    setFile(null);
  };

  

  return (
    <UserLayout>
      <DashboardLayout>
        <div
          className="flex flex-col md:flex-row items-start gap-4 
                w-full md:w-3/4 lg:w-1/2 
                p-4 bg-blue-100 rounded-xl shadow-sm border border-blue-600"
        >
          {/* Profile Image */}
          <img
            className="h-12 w-12 md:h-14 md:w-14 rounded-full object-cover mx-auto md:mx-0"
            src={`${BASE_URL}/${authState.user.profilePicture}`}
            alt="profile"
          />

          {/* Input Area */}
          <div className="flex-1 w-full">
            <textarea
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              name="status"
              id="status"
              placeholder="What's on your mind?"
              className="w-full resize-none min-h-[80px] md:min-h-[100px]
                 p-3 bg-white border border-blue-600 rounded-lg
                 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
            ></textarea>

            {/* Action Row */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mt-3">
              <label
                htmlFor="fileInput"
                className="flex items-center gap-2 cursor-pointer text-gray-600 hover:text-blue-700 transition"
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
                    d="M12 10.5v6m3-3H9m4.06-7.19-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z"
                  />
                </svg>
                <span className="text-sm font-medium">Add photo</span>
                <input
                  onChange={(e) => setFile(e.target.files[0])}
                  type="file"
                  id="fileInput"
                  className="hidden"
                />
              </label>

              <button
                onClick={handlePostSubmit}
                className="w-full sm:w-auto bg-blue-500 hover:bg-blue-600
                         text-white px-6 py-2 rounded-full
                         text-sm font-semibold transition"
              >
                Post
              </button>
            </div>
          </div>
        </div>

        {/* Posts Display */}
        <div className="w-full md:w-3/4 lg:w-1/2 mt-6">
          {postState.posts?.map((post) => (
            <div key={post._id} className="mt-4 p-4 bg-white rounded-lg shadow">
              <div className="flex items-center mb-4">
                <img
                  src={
                    post.userId?.profilePicture
                      ? `${BASE_URL}/${post.userId.profilePicture}`
                      : "/backend/uploads/default.png"
                  }
                  alt="Author"
                  className="h-10 w-10 rounded-full object-cover mr-3"
                />
                <div>
                  <p className="font-semibold">
                    {post.userId?.name || "Unknown User"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(post.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <p className="mb-3">{post.body}</p>
              {post.media && (
                <img
                  src={`${BASE_URL}/${post.media}`}
                  alt="Post content"
                  className="w-full rounded-lg"
                />
              )}
            </div>
          ))}
        </div>
      </DashboardLayout>
    </UserLayout>
  );
};

export default Dashboard;
