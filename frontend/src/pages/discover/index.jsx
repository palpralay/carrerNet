import UserLayout from "@/layouts/UserLayout";
import React, { use, useEffect } from "react";
import DashboardLayout from "@/layouts/dashboardLayout";
import { useDispatch, useSelector } from "react-redux";
import { getAllUsers } from "@/redux/config/action/authAction";

const Discover = () => {

const authState = useSelector((state) => state.auth);
const dispatch = useDispatch();

useEffect(() => {
  if (!authState.all_profile_fetched) {
    dispatch(getAllUsers());
  }
})

  return (
    <UserLayout>
      <DashboardLayout>
        <h1>discover</h1>
      </DashboardLayout>
    </UserLayout>
  );
};

export default Discover;
