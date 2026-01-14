import express from 'express';
import { upload } from '../middleware/upload.middleware.js';
import { uploadProfilePicture, uploadPostImage } from '../controllers/upload.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';

const router = express.Router();

// Protected routes - require authentication
router.post('/profile-picture', authMiddleware, upload.single('image'), uploadProfilePicture);
router.post('/post-image', authMiddleware, upload.single('image'), uploadPostImage);

export default router;
