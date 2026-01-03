import { Router } from "express";
import {
  register,
  login,
  uploadProfilePicture,
  updateUserProfile,
  getUserAndProfile,
  updateProfileData,
  getAllUserProfiles,
  downloadProfile,
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
router.route("/user_update").post(authenticate, updateUserProfile);
router.route("/get_user_and_profile").get(authenticate, getUserAndProfile);
router.route("/update_profile_data").post(authenticate, updateProfileData);
router.route("/get_all_users").get(authenticate, getAllUserProfiles);
router.route("/user/download_resume").get(authenticate, downloadProfile);


export default router;
