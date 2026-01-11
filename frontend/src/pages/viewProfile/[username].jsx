/* eslint-disable @next/next/no-img-element */
// frontend/src/pages/viewProfile/[username].jsx
// COMPLETE SSR SOLUTION - Replace entire file with this

import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import UserLayout from '@/layouts/UserLayout';
import DashboardLayout from '@/layouts/dashboardLayout';
import { BASE_URL } from '@/redux/config';
import { useSelector } from 'react-redux';

const ViewProfile = ({ initialProfileData, ssrError, ssrMode }) => {
  const router = useRouter();
  const { username } = router.query;
  const authState = useSelector((state) => state.auth);
  const [profileData, setProfileData] = useState(initialProfileData);
  const [loading, setLoading] = useState(!initialProfileData);
  const [error, setError] = useState(ssrError);

  useEffect(() => {
    // If SSR failed to load data, try client-side as fallback
    if (!profileData && !loading && username) {
      const fetchProfile = async () => {
        try {
          setLoading(true);
          const token = localStorage.getItem('token');

          if (!token) {
            router.push('/login');
            return;
          }

          const response = await fetch(
            `${BASE_URL}/user/getUserProfileByUsername/${username}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            }
          );

          if (!response.ok) {
            if (response.status === 401) {
              localStorage.removeItem('token');
              router.push('/login');
              return;
            }
            throw new Error('Failed to load profile');
          }

          const data = await response.json();
          setProfileData(data.profile);
          setError(null);
        } catch (err) {
          console.error('❌ Error fetching profile:', err);
          setError(err.message || 'Failed to load profile');
        } finally {
          setLoading(false);
        }
      };

      fetchProfile();
    }
  }, [username, profileData, loading, router]);

  if (loading) {
    return (
      <UserLayout>
        <DashboardLayout>
          <div className="flex flex-col items-center justify-center h-full py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mb-4"></div>
            <p className="text-gray-600 text-lg">
              {ssrMode ? 'Loading from server...' : 'Loading profile...'}
            </p>
          </div>
        </DashboardLayout>
      </UserLayout>
    );
  }

  if (error) {
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
            <p className="text-red-600 font-semibold text-lg">{error}</p>
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

  if (!profileData) {
    return (
      <UserLayout>
        <DashboardLayout>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center">
            <p className="text-yellow-600 font-semibold">Profile not found</p>
          </div>
        </DashboardLayout>
      </UserLayout>
    );
  }

  return (
    <UserLayout>
      <DashboardLayout>
        <div className="space-y-6">
          {/* SSR Debug Badge */}
          {ssrMode && (
            <div className="bg-green-100 border border-green-300 rounded-lg px-4 py-2 text-sm text-green-800">
              ✅ This page was rendered using Server-Side Rendering (SSR)
            </div>
          )}

          {/* Back Button */}
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 transition"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
              />
            </svg>
            <span className="font-medium">Back</span>
          </button>

          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-8">
            {/* Profile Picture */}
            <div className="flex justify-center mb-6">
              <img
                src={
                  profileData.userId?.profilePicture &&
                  profileData.userId.profilePicture !== "default.jpg"
                    ? `${BASE_URL}/${profileData.userId.profilePicture}`
                    : "/images/avatar.png"
                }
                alt={profileData.userId?.name || "User"}
                className="h-32 w-32 rounded-full object-cover border-4 border-indigo-100 shadow-lg"
                onError={(e) => {
                  e.target.src = "/images/avatar.png";
                }}
              />
            </div>

            {/* User Info */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {profileData.userId?.name}
              </h1>
              <p className="text-lg text-gray-500 mb-1">
                @{profileData.userId?.username}
              </p>
              <p className="text-sm text-gray-400">{profileData.userId?.email}</p>
            </div>

            {/* Current Position */}
            {profileData.currentPost && (
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
                      d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 0 0 .75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 0 0-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0 1 12 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 0 1-.673-.38m0 0A2.18 2.18 0 0 1 3 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 0 1 3.413-.387m7.5 0V5.25A2.25 2.25 0 0 0 13.5 3h-3a2.25 2.25 0 0 0-2.25 2.25v.894m7.5 0a48.667 48.667 0 0 0-7.5 0"
                    />
                  </svg>
                  Current Position
                </h2>
                <p className="text-gray-700 text-lg">{profileData.currentPost}</p>
              </div>
            )}

            {/* Bio */}
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
                        <p className="text-sm text-gray-500">{edu.fieldOfStudy}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Connect Button */}
            {authState.user?.username !== username && (
              <div className="mt-8 pt-6 border-t border-gray-200">
                <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-full font-semibold transition">
                  Connect with {profileData.userId?.name?.split(' ')[0]}
                </button>
              </div>
            )}
          </div>
        </div>
      </DashboardLayout>
    </UserLayout>
  );
};

export async function getServerSideProps(context) {
  console.log("🚀 SSR: getServerSideProps called for username:", context.params.username);
  
  try {
    // Parse cookies from request header
    const cookieHeader = context.req.headers.cookie || '';
    console.log("🍪 SSR: Raw cookie header length:", cookieHeader.length);
    console.log("🍪 SSR: Raw cookie preview:", cookieHeader.substring(0, 150) + "...");
    
    const cookies = {};
    cookieHeader.split(';').forEach(cookie => {
      const parts = cookie.trim().split('=');
      if (parts.length >= 2) {
        const name = parts[0];
        const value = parts.slice(1).join('='); // Handle values with = in them
        cookies[name] = value; // Don't decode yet, keep original
      }
    });

    console.log("🍪 SSR: All cookie names found:", Object.keys(cookies));
    
    const token = cookies.token;
    console.log("🔑 SSR: Token found:", token ? `YES (${token.length} chars)` : "NO");
    
    if (token) {
      console.log("🔑 SSR: Token first 30 chars:", token.substring(0, 30) + "...");
      console.log("🔑 SSR: Token last 30 chars:", "..." + token.substring(token.length - 30));
    }
    
    if (!token) {
      console.log("❌ SSR: No token, redirecting to login");
      return {
        redirect: {
          destination: '/login',
          permanent: false,
        },
      };
    }

    const username = context.params.username;
    const apiUrl = `http://localhost:9000/user/getUserProfileByUsername/${username}`;
    
    console.log("📡 SSR: Fetching from:", apiUrl);
    console.log("📡 SSR: Using token:", token.substring(0, 20) + "...");

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log("📡 SSR: Response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ SSR: API error:", response.status, errorText);
      
      if (response.status === 401) {
        return {
          redirect: {
            destination: '/login',
            permanent: false,
          },
        };
      }

      return {
        props: {
          initialProfileData: null,
          ssrError: `Failed to load profile (${response.status})`,
          ssrMode: false,
        }
      };
    }

    const data = await response.json();
    console.log("✅ SSR: Profile loaded successfully");

    return {
      props: {
        initialProfileData: data.profile || null,
        ssrError: null,
        ssrMode: true, // Flag to show SSR badge
      }
    };
  } catch (error) {
    console.error("❌ SSR: Exception:", error.message);
    
    // Return props with error instead of failing completely
    return {
      props: {
        initialProfileData: null,
        ssrError: error.message || 'Failed to load profile',
        ssrMode: false,
      }
    };
  }
}

export default ViewProfile;