// frontend/src/pages/viewProfile/[username].jsx
// FIXED VERSION with proper connection request handling

import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import UserLayout from "@/layouts/UserLayout";
import DashboardLayout from "@/layouts/dashboardLayout";
import { BASE_URL } from "@/redux/config";
import { useSelector, useDispatch } from "react-redux";
import { getAllPosts, deletePost } from "@/redux/config/action/postAction";
import clientServer, {
  sendConnectionRequest,
  getConnectionRequests,
  getReceivedRequests,
  getMyConnections,
} from "@/redux/config/action/authAction";
import { toast } from "sonner";
import Image from "next/image";

const ViewProfile = ({ initialProfileData, ssrError, ssrMode }) => {
  const authState = useSelector((state) => state.auth);
  const postReducer = useSelector((state) => state.posts);
  const router = useRouter();
  const dispatch = useDispatch();
  const { username } = router.query;

  const [profileData, setProfileData] = useState(initialProfileData);
  const [loading, setLoading] = useState(!initialProfileData);
  const [error, setError] = useState(ssrError);
  const [userPosts, setUserPosts] = useState([]);

  // Connection status state
  const [connectionStatus, setConnectionStatus] = useState({
    isMe: false,
    isConnected: false,
    requestSent: false,
    requestReceived: false,
    loading: false,
  });

  // Resume download state
  const [downloadingResume, setDownloadingResume] = useState(false);

  // Fetch profile if not loaded via SSR
  useEffect(() => {
    if (!profileData && !loading && username) {
      const fetchProfile = async () => {
        try {
          setLoading(true);
          const token = localStorage.getItem("token");

          if (!token) {
            router.push("/login");
            return;
          }

          const response = await fetch(
            `${BASE_URL}/user/getUserProfileByUsername/${username}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );

          if (!response.ok) {
            if (response.status === 401) {
              localStorage.removeItem("token");
              router.push("/login");
              return;
            }
            throw new Error("Failed to load profile");
          }

          const data = await response.json();
          setProfileData(data.profile);
          setError(null);
        } catch (err) {
          console.error("Error fetching profile:", err);
          setError(err.message || "Failed to load profile");
        } finally {
          setLoading(false);
        }
      };

      fetchProfile();
    }
  }, [username, profileData, loading, router]);

  // Load connection data
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      dispatch(getMyConnections({ token }));
      dispatch(getConnectionRequests({ token }));
      dispatch(getReceivedRequests({ token }));
    }
  }, [dispatch]);

  useEffect(() => {
    if (!profileData?.userId?._id || !authState.user?._id) return;

    const viewedUserId = profileData.userId._id;
    const currentUserId = authState.user._id;

    // Check if viewing own profile
    const isMe = viewedUserId === currentUserId;

    // Check if already connected
    const isConnected = authState.connections?.some(
      (conn) => conn._id === viewedUserId
    );

    // Check if request already sent
    const requestSent = authState.sentRequests?.some(
      (req) => req.connectionId?._id === viewedUserId
    );

    // Check if received request from this user
    const requestReceived = authState.receivedRequests?.some(
      (req) => req.userId?._id === viewedUserId
    );

    setConnectionStatus({
      isMe,
      isConnected,
      requestSent,
      requestReceived,
      loading: false,
    });
  }, [
    profileData?.userId?._id,
    authState.user?._id,
    authState.connections,
    authState.sentRequests,
    authState.receivedRequests,
  ]);

  // Fetch user posts
  useEffect(() => {
    dispatch(getAllPosts());
  }, [dispatch]);

  useEffect(() => {
    if (router.query.username) {
      const posts = postReducer.posts.filter(
        (post) => post.userId?.username === router.query.username
      );
      setUserPosts(posts);
    }
  }, [postReducer.posts, router.query.username]);

  const handleSendConnectionRequest = async () => {
    if (!profileData?.userId?._id) {
      toast.error("Invalid user profile");
      return;
    }

    setConnectionStatus((prev) => ({ ...prev, loading: true }));

    try {
      const result = await dispatch(
        sendConnectionRequest({
          token: localStorage.getItem("token"),
          userId: profileData.userId._id,
        })
      );

      if (result.error) {
        toast.error(result.payload || "Failed to send request");
      } else {
        toast.success("Connection request sent!");
        // Refresh connection requests
        dispatch(
          getConnectionRequests({ token: localStorage.getItem("token") })
        );

        // Update local state
        setConnectionStatus((prev) => ({
          ...prev,
          requestSent: true,
        }));
      }
    } catch (error) {
      console.error("Error sending connection request:", error);
      toast.error("Failed to send connection request");
    } finally {
      setConnectionStatus((prev) => ({ ...prev, loading: false }));
    }
  };

  const handleDeletePost = async (postId) => {
    try {
      const result = await dispatch(deletePost(postId));
      if (result.error) {
        toast.error(result.payload || "Failed to delete post");
      } else {
        toast.success("Post deleted successfully!");
      }
    } catch (error) {
      console.error("Error deleting post:", error);
      toast.error("Failed to delete post");
    }
  };

  // Render connection button
  const renderConnectionButton = () => {
    if (connectionStatus.isMe) {
      return (
        <div className="flex justify-center">
          <button
            className="gap-2 rounded-full bg-gray-400 px-6 py-2.5 
             text-white cursor-default opacity-90"
            disabled
          >
            Your Profile
          </button>
        </div>
      );
    }

    if (connectionStatus.isConnected) {
      return (
        <div className="flex justify-center">
          <button
            className="gap-2 rounded-full bg-green-600 px-6 py-2.5 
             text-white cursor-default opacity-90 flex items-center"
            disabled
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
              />
            </svg>
            Connected
          </button>
        </div>
      );
    }

    if (connectionStatus.requestSent) {
      return (
        <div className="flex justify-center">
          <button
            className="gap-2 rounded-full bg-yellow-600 px-6 py-2.5 
             text-white cursor-default opacity-90 flex items-center"
            disabled
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-5 animate-pulse"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
              />
            </svg>
            Request Pending
          </button>
        </div>
      );
    }

    if (connectionStatus.requestReceived) {
      return (
        <div className="flex justify-center">
          <button
            onClick={() => router.push("/myconnections")}
            className="gap-2 rounded-full bg-purple-600 px-6 py-2.5 
             text-white hover:bg-purple-700 transition flex items-center"
          >
            Respond to Request
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
              />
            </svg>
          </button>
        </div>
      );
    }

    return (
      <div className="flex justify-center">
        <button
          className="flex cursor-pointer items-center justify-center gap-2 
           rounded-full bg-indigo-600 px-6 py-2.5 
           text-white transition-all duration-200 
           hover:bg-indigo-700 hover:scale-[1.02]
           disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleSendConnectionRequest}
          disabled={connectionStatus.loading}
        >
          {connectionStatus.loading ? "Sending..." : "Add Friend"}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.766Z"
            />
          </svg>
        </button>
      </div>
    );
  };

  if (loading) {
    return (
      <UserLayout>
        <DashboardLayout>
          <div className="flex flex-col items-center justify-center h-full py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mb-4"></div>
            <p className="text-gray-600 text-lg">Loading profile...</p>
          </div>
        </DashboardLayout>
      </UserLayout>
    );
  }

  if (error || !profileData) {
    return (
      <UserLayout>
        <DashboardLayout>
          <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-16 h-16 mx-auto text-red-500 mb-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
              />
            </svg>
            <p className="text-red-600 font-semibold text-lg">
              {error || "Profile not found"}
            </p>
            <button
              onClick={() => router.back()}
              className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-full"
            >
              Go Back
            </button>
          </div>
        </DashboardLayout>
      </UserLayout>
    );
  }

  return (
    <UserLayout>
      <DashboardLayout>
        <div className="bg-white rounded-xl w-full shadow-md border border-gray-200 p-8">
          {/* Cover and Profile Picture */}
          <div className="max-w-3xl mx-auto relative mb-16">
            <div className="h-40 bg-amber-500 rounded-xl shadow-lg border border-amber-200"></div>
            <div className="absolute left-1/2 -bottom-16 transform -translate-x-1/2">
              <Image
                src={
                  profileData.userId?.profilePicture &&
                  profileData.userId.profilePicture !== "default.jpg"
                    ? `${BASE_URL}/${profileData.userId.profilePicture}`
                    : "/images/avatar.png"
                }
                alt={profileData.userId?.name || "User"}
                className="h-32 w-32 rounded-full object-cover border-4 border-white shadow-xl"
                onError={(e) => {
                  e.target.src = "/images/avatar.png";
                }}
                width={64}
                height={64}
              />
            </div>
          </div>

          {/* User Info */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {profileData.userId?.name}
            </h1>
            <p className="text-lg text-gray-500 mb-1">
              @{profileData.userId?.username}
            </p>
            
          </div>

          {/* Connection Button */}
          {renderConnectionButton()}

          {/* Rest of profile content... */}
          {/* Current Position */}
          {profileData.currentPost && (
            <div className="mb-6 mt-10 pb-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6 text-indigo-600"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 0 0 .75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 0 0-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0 1 12 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 0 1-.673-.38m0 0A2.18 2.18 0 0 1 3 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 0 1 3.413-.387m7.5 0V5.25A2.25 2.25 0 0 0 13.5 3h-3a2.25 2.25 0 0 0-2.25 2.25v.894m7.5 0a48.667 48.667 0 0 0-7.5 0"
                  />
                </svg>
                Current Position
              </h2>
              <p className="text-gray-700 text-lg">{profileData.currentPost}</p>
            </div>
          )}

          {profileData.bio && (
            <div className="mb-6 pb-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6 text-indigo-600"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                  />
                </svg>
                About
              </h2>
              <p className="text-gray-700 leading-relaxed">{profileData.bio}</p>
            </div>
          )}

          {/* Past Work */}
          {profileData.pastWork && profileData.pastWork.length > 0 && (
            <div className="mb-6 pb-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6 text-indigo-600"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 0 0 .75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 0 0-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0 1 12 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 0 1-.673-.38m0 0A2.18 2.18 0 0 1 3 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 0 1 3.413-.387m7.5 0V5.25A2.25 2.25 0 0 0 13.5 3h-3a2.25 2.25 0 0 0-2.25 2.25v.894m7.5 0a48.667 48.667 0 0 0-7.5 0"
                  />
                </svg>
                Work Experience
              </h2>
              <div className="space-y-4">
                {profileData.pastWork.map((work, index) => (
                  <div
                    key={index}
                    className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-5 border border-indigo-100 hover:shadow-md transition"
                  >
                    <p className="font-semibold text-gray-900 text-lg mb-1">
                      {work.position}
                    </p>
                    <p className="text-gray-700 mb-1">{work.company}</p>
                    {work.years && (
                      <p className="text-sm text-gray-500">{work.years}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          {profileData.education && profileData.education.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6 text-indigo-600"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5"
                  />
                </svg>
                Education
              </h2>
              <div className="space-y-4">
                {profileData.education.map((edu, index) => (
                  <div
                    key={index}
                    className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-5 border border-blue-100 hover:shadow-md transition"
                  >
                    <p className="font-semibold text-gray-900 text-lg mb-1">
                      {edu.school}
                    </p>
                    <p className="text-gray-700 mb-1">{edu.degree}</p>
                    {edu.fieldOfStudy && (
                      <p className="text-sm text-gray-500">
                        {edu.fieldOfStudy}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          {/* User Posts */}
          {userPosts.length > 0 && (
            <div className="mt-8 space-y-4">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6 text-indigo-600"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
                  />
                </svg>
                Posts
              </h2>
              {userPosts.map((post) => (
                <div
                  key={post._id}
                  className="w-full bg-white rounded-lg border border-gray-200 p-6 shadow-sm"
                >
                  <p className="text-gray-800 mb-4">{post.body}</p>
                  {post.media && (
                    <Image
                      src={`${BASE_URL}/${post.media}`}
                      alt="post"
                      className="w-full h-auto rounded-lg mb-4"
                      width={640}
                      height={480}
                    />
                  )}
                  {connectionStatus.isMe && (
                    <div
                      className="flex gap-2 cursor-pointer hover:text-red-600 transition"
                      onClick={() => handleDeletePost(post._id)}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="size-6"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                        />
                      </svg>
                      <p>Delete your post</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </DashboardLayout>
    </UserLayout>
  );
};

// Keep existing getServerSideProps
export async function getServerSideProps(context) {
  try {
    const cookieHeader = context.req.headers.cookie || "";
    const cookies = {};
    cookieHeader.split(";").forEach((cookie) => {
      const parts = cookie.trim().split("=");
      if (parts.length >= 2) {
        cookies[parts[0]] = parts.slice(1).join("=");
      }
    });

    const token = cookies.token;

    if (!token) {
      return {
        redirect: {
          destination: "/login",
          permanent: false,
        },
      };
    }

    const username = context.params.username;
    const response = await fetch(
      `${BASE_URL}/user/getUserProfileByUsername/${username}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      if (response.status === 401) {
        return {
          redirect: {
            destination: "/login",
            permanent: false,
          },
        };
      }

      return {
        props: {
          initialProfileData: null,
          ssrError: `Failed to load profile (${response.status})`,
          ssrMode: false,
        },
      };
    }

    const data = await response.json();
    return {
      props: {
        initialProfileData: data.profile || null,
        ssrError: null,
        ssrMode: true,
      },
    };
  } catch (error) {
    return {
      props: {
        initialProfileData: null,
        ssrError: error.message || "Failed to load profile",
        ssrMode: false,
      },
    };
  }
}

export default ViewProfile;
