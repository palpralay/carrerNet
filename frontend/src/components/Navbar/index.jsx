import { useRouter } from "next/router";
import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { logoutUser, getAboutUser } from "@/redux/config/action/authAction";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const dispatch = useDispatch();
  const authState = useSelector((state) => state.auth);
  
  // Check if user is actually logged in (from Redux or localStorage)
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const hasToken = !!(authState.loggedIn || authState.token || token);
    setIsLoggedIn(hasToken);

    // Fetch user data if logged in but user data not loaded
    if (hasToken && !authState.user?.name && !authState.isLoading) {
      dispatch(getAboutUser({ token }));
    }
  }, [authState.loggedIn, authState.token, authState.user, authState.isLoading, dispatch]);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    router.push("/login");
  };

  return (
    <nav className="flex items-center justify-between px-6 md:px-16 lg:px-24 xl:px-32 py-4 border-b border-gray-300 bg-white relative">
     
      <p
        onClick={() => router.push("/")}
        className="text-2xl font-extrabold
                    bg-gradient-to-r from-blue-800 via-sky-500 to-yellow-500
                    bg-[length:300%_300%]
                    bg-clip-text text-transparent
                    animate-gradient cursor-pointer">
        CareerNet
      </p>

      <div className="hidden sm:flex items-center gap-8">
        {isLoggedIn && authState.user?.name && (
          <>
            <p className="text-gray-700 font-medium">
              Welcome,{" "}
              <span className="font-semibold">{authState.user.name}</span>
            </p>
            <button
              onClick={handleLogout}
              className="px-6 py-2 border-red-500 text-black cursor-pointer  rounded-full transition"
            >
              Logout
            </button>
          </>
        )}
        {!isLoggedIn && (
          <button
            onClick={() => router.push("/login")}
            className="px-8 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-full transition"
          >
            Login
          </button>
        )}
      </div>

      {/* MOBILE MENU BUTTON */}
      <button
        onClick={() => setOpen(!open)}
        className="sm:hidden"
        aria-label="Menu"
      >
        <svg width="21" height="15" viewBox="0 0 21 15" fill="none">
          <rect width="21" height="1.5" rx=".75" fill="#426287" />
          <rect x="8" y="6" width="13" height="1.5" rx=".75" fill="#426287" />
          <rect x="6" y="13" width="15" height="1.5" rx=".75" fill="#426287" />
        </svg>
      </button>

      {/* MOBILE MENU */}
      <div
        className={`${
          open ? "flex" : "hidden"
        } absolute top-[60px] left-0 w-full bg-white shadow-md py-4 flex-col gap-3 px-5 sm:hidden z-50`}
      >
        {isLoggedIn && authState.user?.name ? (
          <>
            <p className="text-gray-700 font-medium">
              Welcome,{" "}
              <span className="font-semibold">{authState.user.name}</span>
            </p>
            <button
              onClick={handleLogout}
              className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-full text-sm transition"
            >
              Logout
            </button>
          </>
        ) : (
          <button
            onClick={() => router.push("/login")}
            className="px-6 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-full text-sm transition"
          >
            Login
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;