import UserLayout from "@/layouts/UserLayout";
import React, { useEffect, useState } from "react";
import DashboardLayout from "@/layouts/dashboardLayout";
import { useDispatch, useSelector } from "react-redux";
import { getAllUsers } from "@/redux/config/action/authAction";
import { BASE_URL } from "@/redux/config";
import { useRouter } from "next/router";

const Discover = () => {
  const authState = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const router = useRouter();

  const [searchUser, setSearchUser] = useState("");

  console.log("Discover - authState:", authState);
  console.log("Discover - allUsers:", authState.allUsers);

  useEffect(() => {
    if (!authState.all_profile_fetched) {
      dispatch(getAllUsers());
    }
  }, [authState.all_profile_fetched, dispatch]);


  const filteredUsers =
    authState.allUsers?.filter((profile) => {
      if (!searchUser.trim()) return true;

      const searchLower = searchUser.toLowerCase();
      const name = profile.userId?.name?.toLowerCase() || "";
      const username = profile.userId?.username?.toLowerCase() || "";
      const email = profile.userId?.email?.toLowerCase() || "";
      const currentPost = profile.currentPost?.toLowerCase() || "";
      const bio = profile.bio?.toLowerCase() || "";

      return (
        name.includes(searchLower) ||
        username.includes(searchLower) ||
        email.includes(searchLower) ||
        currentPost.includes(searchLower) ||
        bio.includes(searchLower)
      );
    }) || [];

  return (
    <UserLayout>
      <DashboardLayout>
        <div className="space-y-6">
          <h1 className="text-2xl font-bold text-gray-800">Discover People</h1>
          <input
            type="text"
            placeholder="Search Profiles..."
            value={searchUser}
            onChange={(e) => setSearchUser(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md mb-4"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {authState.isLoading ? (
              <div className="col-span-full flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
              </div>
            ) : filteredUsers && filteredUsers.length > 0 ? (
              filteredUsers.map((profile) => (
                <div
                  key={profile._id}
                  className="bg-white rounded-xl shadow-md border border-gray-200 p-6 hover:shadow-lg transition"
                >
                  {/* Profile Picture */}
                  <div className="flex justify-center mb-4">
                    <img
                      src={
                        profile.userId?.profilePicture &&
                        profile.userId.profilePicture !== "default.jpg"
                          ? `${BASE_URL}/${profile.userId.profilePicture}`
                          : "/images/avatar.png"
                      }
                      alt={profile.userId?.name || "User"}
                      className="h-24 w-24 rounded-full object-cover border-4 border-indigo-100"
                      onError={(e) => {
                        e.target.src = "/images/avatar.png";
                      }}
                    />
                  </div>

                  {/* User Info */}
                  <div className="text-center">
                    <h2 className="text-xl font-semibold text-gray-900 mb-1">
                      {profile.userId?.name || "Unknown User"}
                    </h2>
                    <p className="text-sm text-gray-500 mb-1">
                      @{profile.userId?.username || "unknown"}
                    </p>

                    {/* Current Position */}
                    {profile.currentPost && (
                      <p className="text-sm text-gray-700 mb-3 italic">
                        {profile.currentPost}
                      </p>
                    )}

                    {/* Bio */}
                    {profile.bio && (
                      <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                        {profile.bio}
                      </p>
                    )}

                    {/* Connect Button */}
                    <button
                      onClick={() =>
                        router.push(
                          `/viewProfile/${profile.userId?.username}`
                        )
                      }
                      className="w-full mt-2 cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-full text-sm font-semibold transition"
                    >
                      View Profile
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full p-8 text-center">
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
                    d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                  />
                </svg>
                <p className="text-2xl font-medium mb-4 text-violet-800">No users found</p>
                <div className="flex h-1/2 justify-center ">
                  <img src="/images/noUser.svg" alt="" />
                </div>
              </div>
            )}
          </div>
        </div>
      </DashboardLayout>
    </UserLayout>
  );
};

export default Discover;
