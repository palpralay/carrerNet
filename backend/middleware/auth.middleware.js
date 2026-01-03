// middlewares/auth.middleware.js
import User from "../models/user.model.js";

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Authorization token required" });
    }
    
    const token = authHeader.substring(7);
    const user = await User.findOne({ token });
    
    if (!user) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }
    
    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    return res.status(500).json({ message: "Server Error" });
  }
};
