"use client";

import UserLayout from "@/layouts/UserLayout";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <UserLayout>
    <section className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center">
        {/* LEFT CONTENT */}
        <div className="space-y-4 sm:space-y-6 text-center lg:text-left">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight">
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Connect with professionals.
            </span>
            <br />
            <span className="text-gray-900 text-2xl dark:text-gray-100">
              Grow your network. Build your future.
            </span>
          </h1>

          <p
            className="
  text-base sm:text-lg
  text-gray-600 dark:text-gray-400
  max-w-xl mx-auto
  md:text-center
  lg:text-left lg:mx-0
"
          >
            A true social media platform designed for meaningful connections and
            long-term career growth.
          </p>

          <div className="pt-2 sm:pt-4">
            <button
              onClick={() => router.push("/login")}
              className="rounded-md 
               cursor-pointer
               p-10
               text-3xl sm:text-lg font-semibold text-blue-800
               "
            >
              <p className="text-3xl pt-8">Join Now...</p>
            </button>
          </div>
        </div>

        {/* RIGHT IMAGE */}
        <div className="flex justify-center lg:justify-end mt-8 lg:mt-0">
          <div className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg">
            <Image
              src="/images/home.svg"
              alt="Professional networking illustration"
              width={500}
              height={500}
              className="w-full h-auto"
              priority
            />
          </div>
        </div>
      </div>
    </section>
    </UserLayout>
  );
}
