import UserLayout from "@/layouts/UserLayout";
import React, { use, useEffect } from "react";
import DashboardLayout from "@/layouts/dashboardLayout";
import { useDispatch, useSelector } from "react-redux";
import { getAllUsers } from "@/redux/config/action/authAction";

const Discover = () => {
  const authState = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  console.log('Discover - authState:', authState);
  console.log('Discover - allUsers:', authState.allUsers);
  console.log('Discover - all_profile_fetched:', authState.all_profile_fetched);
  console.log('Discover - isLoading:', authState.isLoading);

  useEffect(() => {
    console.log('useEffect - fetching users');
    if (!authState.all_profile_fetched) {
      dispatch(getAllUsers());
    }
  }, [authState.all_profile_fetched, dispatch]);

  return (
    <UserLayout>
      <DashboardLayout>
        <div>
          <h1>All Users Profile</h1>
          <div>
            {authState.isLoading ? (
              <p>Loading users...</p>
            ) : authState.allUsers && authState.allUsers.length > 0 ? (
              authState.allUsers.map((profile) => (
                <div
                  key={profile._id}
                  style={{
                    border: "1px solid #ccc",
                    margin: "10px",
                    padding: "10px",
                  }}
                >
                  <h2>{profile.name}</h2>
                  <p>{profile.email}</p>
                </div>
              ))
            ) : (
              <p>No users found</p>
            )}
          </div>
        </div>
      </DashboardLayout>
    </UserLayout>
  );
};

export default Discover;
