import { Router } from "express";
import multer from "multer";
import path from "path";
import { commentOnPost, createPost, deleteComment, deletePost, getAllPosts, getCommentsByPost, likePost } from "../controllers/posts.conroller.js";
import { authenticate as authMiddleware } from "../middleware/auth.middleware.js";

import { activeCheck } from "../controllers/posts.conroller.js";

const router = Router();

router.route("/").get(activeCheck);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

const upload = multer({ storage: storage });

router
  .route("/post")
  .post(authMiddleware, upload.single("media"), createPost);

router.route("/posts").get(authMiddleware, getAllPosts);
router.route("/delete/:id").delete(authMiddleware, deletePost);
router.route("/comment/:id").post(authMiddleware, commentOnPost);
router.route("/get_comment/:id").get(authMiddleware, getCommentsByPost);
router.route("/delete_comment/:postId/:id").delete(authMiddleware, deleteComment);
router.route("/post_like/:id").get(authMiddleware, likePost);

export default router;
