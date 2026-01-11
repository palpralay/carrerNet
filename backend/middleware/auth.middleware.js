// backend/middleware/auth.middleware.js
import User from "../models/user.model.js";

export const authenticate = async (req, res, next) => {
  try {
    console.log("Auth Middleware - Headers:", req.headers);
    
    const authHeader = req.headers.authorization;
    console.log("Auth Header:", authHeader ? authHeader.substring(0, 30) + "..." : "MISSING");
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("No valid Authorization header");
      return res.status(401).json({ message: "Authorization token required" });
    }
    
    const token = authHeader.substring(7);
    console.log("Extracted token length:", token.length);
    console.log("Token first 20 chars:", token.substring(0, 20) + "...");
    
    const user = await User.findOne({ token });
    
    if (!user) {
      console.log("No user found with this token");
      console.log("Checking if token exists in DB...");
      
      // Debug: Check if ANY user has a token
      const anyUserWithToken = await User.findOne({ token: { $exists: true, $ne: "" } });
      console.log("Any user with token exists:", !!anyUserWithToken);
      
      if (anyUserWithToken) {
        console.log("Sample token in DB (first 20 chars):", anyUserWithToken.token.substring(0, 20) + "...");
      }
      
      return res.status(401).json({ message: "Invalid or expired token" });
    }
    
    console.log("User authenticated:", user.username);
    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(500).json({ message: "Server Error" });
  }
};