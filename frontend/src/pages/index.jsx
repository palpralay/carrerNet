"use client";

import UserLayout from "@/layouts/UserLayout";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";

export default function Home() {
  const router = useRouter();

  // Redux auth state
  const { isAuthenticated } = useSelector((state) => state.auth);

  // Fallback check (page refresh case)
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setHasToken(true);
    }
  }, []);

  const isLoggedIn = isAuthenticated || hasToken;

  return (
    <UserLayout>
     <section className="h-100vh mt-9 flex items-center justify-center px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 items-start lg:items-center">
          {/* LEFT CONTENT */}
          <div className="space-y-3 sm:space-y-4 text-center lg:text-left">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-snug">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Connect with professionals.
              </span>
              <br />
              <span className="text-gray-900 dark:text-gray-100 text-xl sm:text-2xl">
                Grow your network. Build your future.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-xl mx-auto lg:mx-0">
              A true social media platform designed for meaningful connections
              and long-term career growth.
            </p>

            <div className="pt-2">
              <button
                onClick={() => router.push("/login")}
                className="inline-flex items-center rounded-md px-6 py-3 text-lg font-semibold transition"
              >
                <span
                  className="text-3xl font-extrabold
                    bg-gradient-to-r from-blue-800 via-red-500 to-yellow-500
                    bg-[length:300%_300%]
                    bg-clip-text text-transparent
                    animate-gradient cursor-pointer"
                >
                  Join Now →
                </span>
              </button>
            </div>
          </div>

          {/* RIGHT IMAGE */}
          <div className="flex justify-center lg:justify-end">
            <div className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-md">
              <Image
                src="/images/home.svg"
                alt="Professional networking illustration"
                width={500}
                height={500}
                priority
                className="w-full h-auto object-contain block -mt-4 sm:-mt-2 lg:mt-0"
              />
            </div>
          </div>
        </div>
      </section>
    </UserLayout>
  );
}
