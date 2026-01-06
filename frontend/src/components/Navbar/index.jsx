import { useRouter } from "next/router";
import React from "react";
import { useSelector } from "react-redux";
import { useState } from "react";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
 

  return (
    <nav className="flex items-center justify-between px-6 md:px-16 lg:px-24 xl:px-32 py-4 border-b border-gray-300 bg-white relative">
      {/* LOGO */}
      <p
        onClick={() => router.push("/")}
        className="text-2xl font-extrabold bg-gradient-to-r from-blue-800 via-sky-500 to-yellow-500 bg-clip-text text-transparent cursor-pointer"
      >
        CareerNet
      </p>

      {/* DESKTOP MENU */}
      <div className="hidden sm:flex items-center gap-8">
        {isAuthenticated ? (
          <p className="text-gray-700 font-medium">
            Welcome,{" "}
            <span className="font-semibold">
              {user?.name || user?.username || "User"}
            </span>
          </p>
        ) : (
          <button
            onClick={() => router.push("/login")}
            className="px-8 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-full"
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
        } absolute top-[60px] left-0 w-full bg-white shadow-md py-4 flex-col gap-3 px-5 sm:hidden`}
      >
        {isAuthenticated ? (
          <p className="text-gray-700 font-medium">
            Welcome,{" "}
            <span className="font-semibold">
              {user?.name || user?.username || "User"}
            </span>
          </p>
        ) : (
          <button
            onClick={() => router.push("/login")}
            className="px-6 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-full text-sm"
          >
            Login
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
