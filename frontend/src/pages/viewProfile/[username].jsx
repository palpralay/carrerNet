import { clientServer } from '@/redux/config';
import React from 'react'

const ViewProfile = ({ profileData }) => {

  if (!profileData) {
    return <div>Loading...</div>
  }

  return (
    <div>
      <h1>{profileData.userId.name}</h1>
      <p>@{profileData.userId.username}</p>
      <p>{profileData.userId.email}</p>
      {profileData.bio && <p>{profileData.bio}</p>}
      {profileData.currentPost && <p>Current Position: {profileData.currentPost}</p>}
    </div>
  )
}

export default ViewProfile

export async function getServerSideProps(context) {
  console.log("=== DEBUG START ===");
  console.log("Full context:", JSON.stringify(context.params, null, 2));
  console.log("Username from params:", context.params?.username);
  console.log("All Cookies:", context.req.cookies);
  
  try {
    // Get token from cookies
    const token = context.req.cookies.token;
    console.log("Token found:", token ? "YES" : "NO");
    console.log("Token value (first 20 chars):", token ? token.substring(0, 20) : "N/A");
    console.log("Token length:", token ? token.length : 0);
    
    if (!token) {
      console.log("No token - redirecting to login");
      return {
        redirect: {
          destination: '/login',
          permanent: false,
        },
      };
    }
    
    const url = `/user/getUserProfileByUsername/${context.params.username}`;
    console.log("Making request to:", url);
    console.log("Authorization header:", `Bearer ${token.substring(0, 20)}...`);
    
    // First, test if token is valid by checking current user
    console.log("Testing token validity...");
    try {
      const testRequest = await clientServer.get('/get_user_and_profile', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      console.log("Token is valid! User:", testRequest.data.user.username);
    } catch (testError) {
      console.error("Token validation failed:", testError.response?.data);
      return {
        redirect: {
          destination: '/login',
          permanent: false,
        },
      };
    }
    
    const request = await clientServer.get(url, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    const reqData = await request.data;
    console.log("Response data:", reqData);
    console.log("Profile data:", reqData.profile);
    
    return {
      props: {
        profileData: reqData.profile
      }
    };
  } catch (error) {
    console.error("=== ERROR ===");
    console.error("Error message:", error.message);
    console.error("Error response:", error.response?.data);
    console.error("Error status:", error.response?.status);
    return {
      notFound: true
    };
  }
}
