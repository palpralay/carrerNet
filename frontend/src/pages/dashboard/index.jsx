"use client";

import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

const Dashboard = () => {
  const router = useRouter();
  const authState = useSelector((state) => state.auth);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Check both Redux state and localStorage
    const token = localStorage.getItem("token");
    const isLoggedIn = authState?.loggedIn;

    if (!token && !isLoggedIn) {
      router.push("/login");
    } else {
      setIsChecking(false);
    }
  }, [router, authState]);

  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <p className="mt-4">Welcome to your dashboard!</p>
    </div>
  );
};

export default Dashboard;