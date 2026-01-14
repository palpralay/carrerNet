// Test file to verify Cloudinary configuration
import dotenv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';

// Load environment variables FIRST
dotenv.config();

// Configure Cloudinary AFTER loading env vars
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const testCloudinaryConnection = async () => {
  try {
    console.log('Testing Cloudinary connection...');
    console.log('Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME);
    console.log('API Key:', process.env.CLOUDINARY_API_KEY ? '✓ Set' : '✗ Not set');
    console.log('API Secret:', process.env.CLOUDINARY_API_SECRET ? '✓ Set' : '✗ Not set');
    
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      throw new Error('Cloudinary credentials not found in .env file');
    }
    
    // Ping Cloudinary API
    const result = await cloudinary.api.ping();
    
    console.log('\n✅ Cloudinary connection successful!');
    console.log('Status:', result.status);
    return true;
  } catch (error) {
    console.error('\n❌ Cloudinary connection failed:');
    console.error('Error:', error.message);
    if (error.http_code) {
      console.error('HTTP Code:', error.http_code);
    }
    return false;
  }
};

// Run test
testCloudinaryConnection();
