// Utility function for uploading images to Cloudinary via backend
import { clientServer } from '@/redux/config';

/**
 * Upload an image file to Cloudinary through the backend API
 * @param {File} file - The image file to upload
 * @param {string} type - The upload type ('profile' or 'post')
 * @returns {Promise<{url: string, publicId: string}>} - The uploaded image URL and public ID
 */
export const uploadImageToCloudinary = async (file, type = 'post') => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('No authentication token found');
  }

  if (!file) {
    throw new Error('No file provided');
  }

  // Validate file type
  if (!file.type.startsWith('image/')) {
    throw new Error('Only image files are allowed');
  }

  // Validate file size (5MB max)
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    throw new Error('File size must be less than 5MB');
  }

  const formData = new FormData();
  formData.append('image', file);

  const endpoint = type === 'profile' 
    ? '/api/upload/profile-picture' 
    : '/api/upload/post-image';

  try {
    const response = await clientServer.post(endpoint, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    });

    return {
      url: response.data.url,
      publicId: response.data.publicId,
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to upload image'
    );
  }
};

/**
 * Create a preview URL for a file
 * @param {File} file - The file to preview
 * @returns {string} - Object URL for preview
 */
export const createImagePreview = (file) => {
  return URL.createObjectURL(file);
};

/**
 * Revoke a preview URL to free memory
 * @param {string} url - The object URL to revoke
 */
export const revokeImagePreview = (url) => {
  if (url && url.startsWith('blob:')) {
    URL.revokeObjectURL(url);
  }
};

/**
 * Validate image file
 * @param {File} file - The file to validate
 * @returns {{valid: boolean, error: string|null}}
 */
export const validateImageFile = (file) => {
  if (!file) {
    return { valid: false, error: 'No file selected' };
  }

  if (!file.type.startsWith('image/')) {
    return { valid: false, error: 'Only image files are allowed' };
  }

  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    return { valid: false, error: 'File size must be less than 5MB' };
  }

  return { valid: true, error: null };
};

export default {
  uploadImageToCloudinary,
  createImagePreview,
  revokeImagePreview,
  validateImageFile,
};
