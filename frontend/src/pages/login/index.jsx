import UserLayout from "@/layouts/UserLayout";
import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/router";
import { loginUser, registerUser } from "@/redux/config/action/authAction";
import { reset } from "@/redux/config/reducer/authReducer";
import Image from "next/image";
import { toast } from "sonner";

const LoginComponent = () => {
  const authState = useSelector((state) => state.auth);
  const router = useRouter();
  const [state, setState] = useState("login");
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
  });

  const hasProcessedSuccess = useRef(false);
  const dispatch = useDispatch();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Reset hasProcessedSuccess ref to allow new login attempts
    hasProcessedSuccess.current = false;

    if (state === "login") {
      console.log("Login attempt:", formData);
      dispatch(loginUser(formData));
    } else {
      console.log("Register attempt:", formData);
      dispatch(registerUser(formData));
    }
  };

  // Redirect if already logged in - Only on initial mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token || authState.loggedIn) {
      router.replace("/dashboard");
    }
  }, [router, authState.loggedIn]); // Run only once

  // Listen for login success from Redux state changes
  useEffect(() => {
    if (authState.isSuccess && authState.loggedIn && authState.token) {
      console.log('Auth success - redirecting to dashboard');
      
      if (state === "login") {
        toast.success("Login successful");
      } else {
        toast.success("Registration successful!");
      }
      
      // Small delay to ensure state and cookies are set
      setTimeout(() => {
        router.replace("/dashboard");
      }, 100);
      
      // Reset success state to prevent loop
      // Don't reset immediately or it might flick back to login
    }

    if (authState.isError) {
      const errorMessage = authState.message || (state === "login" ? "Invalid Credentials" : "Registration failed");
      console.error('Auth error:', errorMessage);
      toast.error(errorMessage);
      dispatch(reset()); // Reset error state so user can try again cleanly
    }
  }, [authState.isSuccess, authState.isError, authState.loggedIn, authState.token, router, state, dispatch, authState.message]);

  const handleToggleState = () => {
    setState(state === "login" ? "register" : "login");
    setFormData({
      name: "",
      username: "",
      email: "",
      password: "",
    });
    hasProcessedSuccess.current = false;
    dispatch(reset());
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <UserLayout>
      <section className="h-100vh mt-12  flex items-center justify-center px-4">
        <div
          className="max-w-5xl w-full grid grid-cols-1 bg-gradient-to-r from-blue-100 via-sky-300 to-cyan-100
            bg-[length:300%_300%] animate-gradient rounded-2xl p-8 lg:grid-cols-2 gap-10 items-center"
        >
          <div className="hidden lg:flex justify-center">
            <Image
              src="/images/login.svg"
              alt="Login illustration"
              width={400}
              height={400}
              className="max-h-[80vh] max-w-md"
            />
          </div>

          <form
            onSubmit={handleSubmit}
            className="w-full max-w-md mx-auto bg-blue-800-900 border border-blue-800 rounded-2xl px-8 py-10"
          >
            <h1 className="text-blue-800 text-3xl font-semibold text-center">
              {state === "login" ? "Login" : "Sign up"}
            </h1>

            <p className="text-blue-800-400 text-sm mt-2 text-center">
              Please sign in to continue
            </p>

            {state !== "login" && (
              <div className="grid grid-cols-2 gap-3 mt-6">
                <div className="flex items-center bg-zinc-800-800 border border-zinc-800-700 h-12 rounded-full px-6 gap-2">
                  <input
                    type="text"
                    name="name"
                    placeholder="Name"
                    className="w-full bg-transparent text-zinc-800 placeholder-zinc-800-400 outline-none"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="flex items-center bg-zinc-800-800 border border-zinc-800-700 h-12 rounded-full px-6 gap-2">
                  <input
                    type="text"
                    name="username"
                    placeholder="Username"
                    className="w-full bg-transparent text-zinc-800 placeholder-zinc-800-400 outline-none"
                    value={formData.username}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            )}

            <div className="flex items-center mt-4 bg-zinc-800-800 border border-zinc-800-700 h-12 rounded-full px-6 gap-2">
              <input
                type="email"
                name="email"
                placeholder="Email"
                className="w-full bg-transparent text-zinc-800 placeholder-zinc-800-400 outline-none"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="flex items-center mt-4 bg-zinc-800-800 border border-zinc-800-700 h-12 rounded-full px-6 gap-2">
              <input
                type="password"
                name="password"
                placeholder="Password"
                className="w-full bg-transparent text-zinc-800 placeholder-zinc-800-400 outline-none"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <button
              type="submit"
              disabled={authState.isLoading}
              className="mt-5 w-full h-11 rounded-full cursor-pointer bg-indigo-600 text-white hover:bg-indigo-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {authState.isLoading ? "Processing..." : (state === "login" ? "Login" : "Sign up")}
            </button>

            <p
              onClick={handleToggleState}
              className="text-zinc-800-400 text-sm mt-4 text-center cursor-pointer"
            >
              {state === "login"
                ? "Don't have an account?"
                : "Already have an account?"}
              <span className="text-blue-800 hover:underline ml-1">
                Click here
              </span>
            </p>
          </form>
        </div>
      </section>
    </UserLayout>
  );
};

export default LoginComponent;