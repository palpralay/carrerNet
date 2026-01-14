/* eslint-disable @next/next/no-img-element */
import DashboardLayout from "@/layouts/dashboardLayout";
import UserLayout from "@/layouts/UserLayout";
import { BASE_URL } from "@/redux/config";
import {
  getMyConnections,
  getConnectionRequests,
  getReceivedRequests,
  respondToConnectionRequest,
  getAboutUser,
} from "@/redux/config/action/authAction";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";

const MyConnections = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const authState = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState("connections"); // connections, sent, received

  useEffect(() => {
    const token = localStorage.getItem("token");
    
    // Check purely based on token existence first
    if (!token) {
      router.replace("/login");
      return;
    }

    // Load all connection data
    // We dispatch even if authState.loggedIn is false because we have a token
    // This handles the page reload case properly
    dispatch(getMyConnections({ token }));
    dispatch(getConnectionRequests({ token }));
    dispatch(getReceivedRequests({ token }));
    
    // Also ensuring user profile is fetched if needed
    if (!authState.loggedIn || !authState.profileFetched) {
        dispatch(getAboutUser({ token }));
    }
  }, [dispatch, router]); // Run once on mount

  const handleRespondToRequest = async (requestID, action) => {
    try {
      const result = await dispatch(
        respondToConnectionRequest({
          token: localStorage.getItem("token"),
          requestID,
          action,
        })
      );

      if (result.error) {
        toast.error(result.payload || `Failed to ${action} request`);
      } else {
        toast.success(
          `Connection request ${action === "accept" ? "accepted" : "rejected"}!`
        );

        // Refresh all connection data
        const token = localStorage.getItem("token");
        dispatch(getMyConnections({ token }));
        dispatch(getReceivedRequests({ token }));
      }
    } catch (error) {
      console.error("Error responding to request:", error);
      toast.error("Failed to process request");
    }
  };

  const tabs = [
    {
      id: "connections",
      label: "My Connections",
      count: authState.connections?.length || 0,
    },
    {
      id: "received",
      label: "Requests Received",
      count: authState.receivedRequests?.length || 0,
    },
    {
      id: "sent",
      label: "Requests Sent",
      count: authState.sentRequests?.length || 0,
    },
  ];

  const renderConnectionCard = (user, type = "connection") => {
    return (
      <div
        key={user._id}
        className="bg-white rounded-xl shadow-md border border-gray-200 p-6 hover:shadow-lg transition"
      >
        <div className="flex items-center gap-4">
          {/* Profile Picture */}
          <Image
            src={
              user.profilePicture && user.profilePicture !== "default.jpg"
                ? (user.profilePicture.startsWith('http') 
                    ? user.profilePicture 
                    : `${BASE_URL}/${user.profilePicture}`)
                : "/images/avatar.png"
            }
            alt={user.name || "User"}
            className="h-16 w-16 rounded-full object-cover border-2 border-indigo-100"
            onError={(e) => {
              e.target.src = "/images/avatar.png";
            }}
            width={64}
            height={64}
          />

          {/* User Info */}
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">
              {user.name || "Unknown User"}
            </h3>
            <p className="text-sm text-gray-500">@{user.username || "unknown"}</p>
            {user.email && (
              <p className="text-xs text-gray-400 mt-1">{user.email}</p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            {type === "received" && (
              <>
                <button
                  onClick={() =>
                    handleRespondToRequest(user.requestId, "accept")
                  }
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition"
                >
                  Accept
                </button>
                <button
                  onClick={() =>
                    handleRespondToRequest(user.requestId, "reject")
                  }
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition"
                >
                  Reject
                </button>
              </>
            )}
            {type === true && (
              <span className="text-yellow-600 text-sm font-medium px-4 py-2 bg-yellow-50 rounded-lg">
                Pending
              </span>
            )}
            {type === "connection" && (
              <button
                onClick={() => router.push(`/viewProfile/${user.username}`)}
                className="bg-indigo-600 hover:bg-indigo-700 cursor-pointer text-white px-4 py-2 rounded-lg text-sm font-semibold transition"
              >
                View Profile
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderEmptyState = (message, icon) => {
    return (
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-12 text-center">
        <div className="text-6xl mb-4">{icon}</div>
        <p className="text-gray-500 text-lg font-medium">{message}</p>
      </div>
    );
  };

  return (
    <UserLayout>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-800">My Network</h1>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-2">
            <div className="flex gap-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 px-6 py-3 rounded-lg cursor-pointer font-semibold transition ${
                    activeTab === tab.id
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {tab.label}
                  {tab.count > 0 && (
                    <span
                      className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                        activeTab === tab.id
                          ? "bg-indigo-700"
                          : "bg-gray-200 text-gray-700"
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Loading State */}
          {authState.isLoading && (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
          )}

          {/* Content Based on Active Tab */}
          {!authState.isLoading && (
            <div className="space-y-4">
              {/* My Connections Tab */}
              {activeTab === "connections" && (
                <>
                  {authState.connections && authState.connections.length > 0 ? (
                    authState.connections.map((user) =>
                      renderConnectionCard(user, "connection")
                    )
                  ) : (
                    renderEmptyState(
                      "You don't have any connections yet. Start by discovering people!",
                      "🤝"
                    )
                  )}
                </>
              )}

              {/* Received Requests Tab */}
              {activeTab === "received" && (
                <>
                  {authState.receivedRequests &&
                  authState.receivedRequests.length > 0 ? (
                    authState.receivedRequests.map((request) =>
                      renderConnectionCard(
                        {
                          ...request.userId,
                          requestId: request._id,
                        },
                        "received"
                      )
                    )
                  ) : (
                    renderEmptyState(
                      "No pending connection requests",
                      "📭"
                    )
                  )}
                </>
              )}

              {/* Sent Requests Tab */}
              {activeTab === "sent" && (
                <>
                  {authState.sentRequests &&
                  authState.sentRequests.length > 0 ? (
                    authState.sentRequests.map((request) =>
                      renderConnectionCard(
                        {
                          ...request.connectionId,
                          requestId: request._id,
                        },
                        "sent"
                      )
                    )
                  ) : (
                    renderEmptyState(
                      "You haven't sent any connection requests",
                      "✉️"
                    )
                  )}
                </>
              )}
            </div>
          )}

          {/* Quick Actions */}
          <div className="bg-linear-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-200 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">
              Grow Your Network
            </h2>
            <p className="text-gray-600 mb-4">
              Discover and connect with professionals in your field
            </p>
            <button
              onClick={() => router.push("/discover")}
              className="bg-indigo-600 hover:bg-indigo-700 cursor-pointer text-white px-6 py-2 rounded-full font-semibold transition"
            >
              Discover People
            </button>
          </div>
        </div>
      </DashboardLayout>
    </UserLayout>
  );
};

export default MyConnections;