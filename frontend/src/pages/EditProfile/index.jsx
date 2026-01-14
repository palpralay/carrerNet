import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getAboutUser,
  updateUserInfo,
  updateProfileData,
  uploadProfilePicture,
} from "@/redux/config/action/authAction";
import { BASE_URL } from "@/redux/config";
import { useRouter } from "next/router";
import UserLayout from "@/layouts/UserLayout";

const EditProfile = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const authState = useSelector((state) => state.auth);

  // User basic info state
  const [userInfo, setUserInfo] = useState({
    name: "",
    username: "",
    email: "",
  });

  // Profile data state
  const [profileData, setProfileData] = useState({
    bio: "",
    currentPost: "",
    pastWork: [],
    education: [],
  });

  // Profile picture state
  const [profilePicture, setProfilePicture] = useState(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState("");

  // UI state
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [activeTab, setActiveTab] = useState("basic");

  // Load user data on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      // No token, redirect to login
      router.push("/login");
      return;
    }

    dispatch(getAboutUser({ token }))
      .then((res) => {
        if (res.payload) {
          const { user, profile } = res.payload;

          // Set user info
          if (user) {
            setUserInfo({
              name: user.name || "",
              username: user.username || "",
              email: user.email || "",
            });

            // Set profile picture preview
            if (user.profilePicture && user.profilePicture !== "default.jpg") {
              const imageUrl = user.profilePicture.startsWith("http")
                ? user.profilePicture
                : `${BASE_URL}/${user.profilePicture}`;
              setProfilePicturePreview(imageUrl);
            }
          }

          // Set profile data
          if (profile) {
            setProfileData({
              bio: profile.bio || "",
              currentPost: profile.currentPost || "",
              pastWork: profile.pastWork || [],
              education: profile.education || [],
            });
          }
        } else if (res.error) {
          // Authentication failed, redirect to login
          router.push("/login");
        }
      })
      .catch(() => {
        // Error fetching user data, redirect to login
        router.push("/login");
      });
  }, [dispatch, router]);

  // Handle user info change
  const handleUserInfoChange = (e) => {
    setUserInfo({
      ...userInfo,
      [e.target.name]: e.target.value,
    });
  };

  // Handle profile data change
  const handleProfileDataChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value,
    });
  };

  // Handle profile picture change
  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePicture(file);
      setProfilePicturePreview(URL.createObjectURL(file));
    }
  };

  // Handle work experience
  const addWorkExperience = () => {
    setProfileData({
      ...profileData,
      pastWork: [
        ...profileData.pastWork,
        { company: "", position: "", years: "" },
      ],
    });
  };

  const removeWorkExperience = (index) => {
    const newPastWork = profileData.pastWork.filter((_, i) => i !== index);
    setProfileData({ ...profileData, pastWork: newPastWork });
  };

  const handleWorkChange = (index, field, value) => {
    const newPastWork = [...profileData.pastWork];
    newPastWork[index][field] = value;
    setProfileData({ ...profileData, pastWork: newPastWork });
  };

  // Handle education
  const addEducation = () => {
    setProfileData({
      ...profileData,
      education: [
        ...profileData.education,
        { school: "", degree: "", fieldOfStudy: "" },
      ],
    });
  };

  const removeEducation = (index) => {
    const newEducation = profileData.education.filter((_, i) => i !== index);
    setProfileData({ ...profileData, education: newEducation });
  };

  const handleEducationChange = (index, field, value) => {
    const newEducation = [...profileData.education];
    newEducation[index][field] = value;
    setProfileData({ ...profileData, education: newEducation });
  };

  // Save user info
  const handleSaveUserInfo = async () => {
    setLoading(true);
    setMessage({ text: "", type: "" });

    try {
      const result = await dispatch(updateUserInfo(userInfo));

      if (result.type.includes("fulfilled")) {
        setMessage({
          text: "Basic info updated successfully!",
          type: "success",
        });
        // Refresh user data
        dispatch(getAboutUser({ token: localStorage.getItem("token") }));
      } else {
        setMessage({
          text: result.payload || "Failed to update basic info",
          type: "error",
        });
      }
    } catch (error) {
      setMessage({ text: "An error occurred", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  // Save profile data
  const handleSaveProfileData = async () => {
    setLoading(true);
    setMessage({ text: "", type: "" });

    try {
      const result = await dispatch(updateProfileData(profileData));

      if (result.type.includes("fulfilled")) {
        setMessage({ text: "Profile updated successfully!", type: "success" });
        // Refresh user data
        dispatch(getAboutUser({ token: localStorage.getItem("token") }));
      } else {
        setMessage({
          text: result.payload || "Failed to update profile",
          type: "error",
        });
      }
    } catch (error) {
      setMessage({ text: "An error occurred", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  // Upload profile picture
  const handleUploadProfilePicture = async () => {
    if (!profilePicture) {
      setMessage({ text: "Please select a picture", type: "error" });
      return;
    }

    setLoading(true);
    setMessage({ text: "", type: "" });

    try {
      // Pass the file directly, the action will create FormData
      const result = await dispatch(uploadProfilePicture(profilePicture));

      if (result.type.includes("fulfilled")) {
        setMessage({
          text: "Profile picture uploaded successfully!",
          type: "success",
        });
        // Refresh user data
        dispatch(getAboutUser({ token: localStorage.getItem("token") }));
        setProfilePicture(null);
      } else {
        setMessage({
          text: result.payload || "Failed to upload picture",
          type: "error",
        });
      }
    } catch (error) {
      setMessage({ text: "An error occurred", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <UserLayout>
      <div className="max-w-4xl mx-auto p-6 overflow-y-auto h-full">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold mb-6 text-gray-800">
            Edit Profile
          </h1>
          <div className="flex items-center justify-between ">
            <button
              onClick={() => router.push("/dashboard")}
              className="text-indigo-600 cursor-pointer hover:text-indigo-700 font-medium"
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>

        {/* Message Display */}
        {message.text && (
          <div
            className={`mb-4 p-4 rounded-lg ${
              message.type === "success"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <div className="flex space-x-4 ">
            <button
              onClick={() => setActiveTab("basic")}
              className={`pb-2 px-4 font-medium cursor-pointer ${
                activeTab === "basic"
                  ? "border-b-2 border-indigo-500 text-indigo-600"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              Basic Info
            </button>
            <button
              onClick={() => setActiveTab("profile")}
              className={`pb-2 px-4 cursor-pointer font-medium ${
                activeTab === "profile"
                  ? "border-b-2 border-indigo-500 text-indigo-600"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              Profile Details
            </button>
            <button
              onClick={() => setActiveTab("picture")}
              className={`pb-2 px-4 cursor-pointer font-medium${
                activeTab === "picture"
                  ? "border-b-2 border-indigo-500 text-indigo-600"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              Profile Picture
            </button>
          </div>
        </div>

        {/* Basic Info Tab */}
        {activeTab === "basic" && (
          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">
              Basic Information
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={userInfo.name}
                  onChange={handleUserInfoChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  name="username"
                  value={userInfo.username}
                  onChange={handleUserInfoChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Enter your username"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={userInfo.email}
                  onChange={handleUserInfoChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Enter your email"
                />
              </div>

              <button
                onClick={handleSaveUserInfo}
                disabled={loading}
                className="w-full bg-indigo-600 text-white py-2 px-4 cursor-pointer rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition duration-200"
              >
                {loading ? "Saving..." : "Save Basic Info"}
              </button>
            </div>
          </div>
        )}

        {/* Profile Details Tab */}
        {activeTab === "profile" && (
          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">
              Profile Details
            </h2>

            <div className="space-y-6">
              {/* Bio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bio
                </label>
                <textarea
                  name="bio"
                  value={profileData.bio}
                  onChange={handleProfileDataChange}
                  rows="4"
                  className="w-full px-4 py-2 border resize-none border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Tell us about yourself..."
                />
              </div>

              {/* Current Position */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Position
                </label>
                <input
                  type="text"
                  name="currentPost"
                  value={profileData.currentPost}
                  onChange={handleProfileDataChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="e.g., Software Engineer at Company"
                />
              </div>

              {/* Work Experience */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Work Experience
                  </label>
                  <button
                    onClick={addWorkExperience}
                    className="text-indigo-600 hover:text-indigo-700 cursor-pointer text-sm font-medium"
                  >
                    + Add Experience
                  </button>
                </div>

                {profileData.pastWork.map((work, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg p-4 mb-3"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="font-medium text-gray-700">
                        Experience {index + 1}
                      </h4>
                      <button
                        onClick={() => removeWorkExperience(index)}
                        className="text-red-600 hover:text-red-700 text-sm"
                      >
                        Remove
                      </button>
                    </div>

                    <div className="space-y-3">
                      <input
                        type="text"
                        value={work.company}
                        onChange={(e) =>
                          handleWorkChange(index, "company", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        placeholder="Company Name"
                      />
                      <input
                        type="text"
                        value={work.position}
                        onChange={(e) =>
                          handleWorkChange(index, "position", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        placeholder="Position"
                      />
                      <input
                        type="text"
                        value={work.years}
                        onChange={(e) =>
                          handleWorkChange(index, "years", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        placeholder="Years (e.g., 2020-2023)"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Education */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Education
                  </label>
                  <button
                    onClick={addEducation}
                    className="text-indigo-600 hover:text-indigo-700 cursor-pointer text-sm font-medium"
                  >
                    + Add Education
                  </button>
                </div>

                {profileData.education.map((edu, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg p-4 mb-3"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="font-medium text-gray-700">
                        Education {index + 1}
                      </h4>
                      <button
                        onClick={() => removeEducation(index)}
                        className="text-red-600 hover:text-red-700 text-sm"
                      >
                        Remove
                      </button>
                    </div>

                    <div className="space-y-3">
                      <input
                        type="text"
                        value={edu.school}
                        onChange={(e) =>
                          handleEducationChange(index, "school", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        placeholder="School/University Name"
                      />
                      <input
                        type="text"
                        value={edu.degree}
                        onChange={(e) =>
                          handleEducationChange(index, "degree", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        placeholder="Degree (e.g., Bachelor's, Master's)"
                      />
                      <input
                        type="text"
                        value={edu.fieldOfStudy}
                        onChange={(e) =>
                          handleEducationChange(
                            index,
                            "fieldOfStudy",
                            e.target.value
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        placeholder="Field of Study"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={handleSaveProfileData}
                disabled={loading}
                className="w-full bg-indigo-600 cursor-pointer text-white py-2 px-4 rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition duration-200"
              >
                {loading ? "Saving..." : "Save Profile Details"}
              </button>
            </div>
          </div>
        )}

        {/* Profile Picture Tab */}
        {activeTab === "picture" && (
          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">
              Profile Picture
            </h2>

            <div className="space-y-4">
              {/* Current Picture Preview */}
              <div className="flex justify-center">
                <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-gray-200">
                  {profilePicturePreview ? (
                    <img
                      src={profilePicturePreview}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-500 text-4xl">
                        {userInfo.name
                          ? userInfo.name.charAt(0).toUpperCase()
                          : "?"}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* File Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Choose New Picture
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleProfilePictureChange}
                  className="w-full px-4 py-2 border border-gray-300 cursor-pointer rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <p className="text-sm text-gray-500 mt-2">
                  Accepted formats: JPG, PNG, GIF (Max 5MB)
                </p>
              </div>

              <button
                onClick={handleUploadProfilePicture}
                disabled={loading || !profilePicture}
                className="w-full bg-indigo-600 text-white cursor-pointer py-2 px-4 rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition duration-200"
              >
                {loading ? "Uploading..." : "Upload Profile Picture"}
              </button>
            </div>
          </div>
        )}

        {/* Back to Profile Button */}
      </div>
    </UserLayout>
  );
};

export default EditProfile;
