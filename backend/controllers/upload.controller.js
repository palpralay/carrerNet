import { uploadToCloudinary } from '../middleware/upload.middleware.js';

// Example: Upload profile picture
export const uploadProfilePicture = async (req, res) => {
  try {
    console.log('📸 Upload profile picture request received');
    console.log('File:', req.file ? 'Present' : 'Missing');
    console.log('User:', req.user ? req.user.username : 'No user');
    
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    console.log('Uploading to Cloudinary...');
    // Upload to Cloudinary
    const result = await uploadToCloudinary(req.file, 'carrernet/profiles');
    
    console.log('✅ Upload successful:', result.secure_url);

    // Save the URL to your database
    // Example: await User.findByIdAndUpdate(req.user.id, { profilePicture: result.secure_url });

    res.status(200).json({
      message: 'File uploaded successfully',
      url: result.secure_url,
      publicId: result.public_id
    });
  } catch (error) {
    console.error('❌ Upload error:', error);
    res.status(500).json({ message: 'Error uploading file', error: error.message });
  }
};

// Example: Upload post image
export const uploadPostImage = async (req, res) => {
  try {
    console.log('📷 Upload post image request received');
    console.log('File:', req.file ? 'Present' : 'Missing');
    console.log('User:', req.user ? req.user.username : 'No user');
    
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    console.log('Uploading to Cloudinary...');
    const result = await uploadToCloudinary(req.file, 'carrernet/posts');
    
    console.log('✅ Upload successful:', result.secure_url);

    res.status(200).json({
      message: 'Image uploaded successfully',
      url: result.secure_url,
      publicId: result.public_id
    });
  } catch (error) {
    console.error('❌ Upload error:', error);
    res.status(500).json({ message: 'Error uploading image', error: error.message });
  }
};
