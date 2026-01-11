import { Router } from "express";
import {
  register,
  login,
  logout,
  uploadProfilePicture,
  updateUserProfile,
  getUserAndProfile,
  updateProfileData,
  getAllUserProfiles,
  downloadProfile,
  sendConnectionRequest,
  getMySentConnectionRequests,
  getMyReceivedConnectionRequests,
  whatAreMyConnections,
  respondToConnectionRequest,
  getUserProfileByUsername,
} from "../controllers/user.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import multer from "multer";
const router = Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

router
  .route("/upload_profile_picture")
  .post(authenticate, upload.single("profile_picture"), uploadProfilePicture);

router.route("/register").post(register);
router.route("/login").post(login);
router.route("/logout").post(authenticate, logout);
router.route("/user_update").post(authenticate, updateUserProfile);
router.route("/get_user_and_profile").get(authenticate, getUserAndProfile);
router.route("/update_profile_data").post(authenticate, updateProfileData);
router.route("/user/get_all_users").get(authenticate, getAllUserProfiles);
router.route("/user/download_resume").get(authenticate, downloadProfile);
router.route("/user/send_connection_request/:connectionID").post(authenticate, sendConnectionRequest);
router.route("/user/getConnectionRequests").get(authenticate, getMySentConnectionRequests); //
router.route("/user/getReceivedRequests").get(authenticate, getMyReceivedConnectionRequests);
router.route("/user/user_connection_request").get(authenticate, whatAreMyConnections);
router.route("/user/accept_connection_request/:requestID/:action").post(authenticate, respondToConnectionRequest);
router.route("/user/getUserProfileByUsername/:username").get(authenticate, getUserProfileByUsername);

export default router;