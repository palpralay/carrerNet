import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

// Ensure dotenv is loaded
dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Verify configuration on import
if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
  console.warn(' Warning: Cloudinary credentials not found in environment variables');
}

export default cloudinary;
