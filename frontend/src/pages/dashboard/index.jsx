"use client";

import UserLayout from "@/layouts/UserLayout";
import { getAboutUser } from "@/redux/config/action/authAction";
import { getAllPosts } from "@/redux/config/action/postAction";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";

const Dashboard = () => {
  const router = useRouter();
  const authState = useSelector((state) => state.auth);
  const [isChecking, setIsChecking] = useState(true);
  const dispatch = useDispatch();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
    } else {
      setIsChecking(false);
      // Fetch user data if not already loaded
      if (!authState.profileFetched) {
        dispatch(getAboutUser({ token }));
      }
      dispatch(getAllPosts());
    }
  }, [dispatch, router, authState.profileFetched]);

  if (isChecking || (authState.isLoading && !authState.user?.name)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <UserLayout>
    <div className="p-8">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <p className="mt-4">Welcome to your dashboard!</p>
      <h5 className="text-xl font-semibold text-gray-700">
        Hi, {authState.user?.name || authState.user?.username}
      </h5>
    </div>
    </UserLayout>
  );
};

export default Dashboard;