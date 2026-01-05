import UserLayout from "@/layouts/UserLayout";
import React from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/router";
import { useEffect } from "react";
export const LoginComponent = () => {
  const authState = useSelector((state) => state.auth);

  const router = useRouter();

  useEffect(() => {
    if (authState.loggedin) {
      router.push("/dashboard");
    }
  });

  return (
    <UserLayout>
      <div>
        
        <div>
          <img src="/images/login.svg" alt="" />
        </div>
      </div>
    </UserLayout>
  );
};
export default LoginComponent;
