import React, { useState, useRef } from 'react';

/**
 * Reusable Image Upload Component with Preview
 * @param {Function} onImageSelect - Callback when image is selected
 * @param {string} currentImage - Current image URL for preview
 * @param {string} label - Label for the upload button
 * @param {string} accept - Accepted file types
 * @param {number} maxSizeMB - Maximum file size in MB
 */
const ImageUpload = ({
  onImageSelect,
  currentImage = null,
  label = 'Choose Image',
  accept = 'image/*',
  maxSizeMB = 5,
  className = '',
  showPreview = true,
  circular = false,
}) => {
  const [preview, setPreview] = useState(currentImage);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setError('');

    if (!file) {
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Only image files are allowed');
      return;
    }

    // Validate file size
    const maxSize = maxSizeMB * 1024 * 1024;
    if (file.size > maxSize) {
      setError(`File size must be less than ${maxSizeMB}MB`);
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);

    // Call parent callback
    if (onImageSelect) {
      onImageSelect(file);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemove = () => {
    setPreview(null);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (onImageSelect) {
      onImageSelect(null);
    }
  };

  return (
    <div className={`image-upload-container ${className}`}>
      {/* Preview */}
      {showPreview && preview && (
        <div className="mb-4 flex justify-center">
          <div className={`relative ${circular ? 'rounded-full' : 'rounded-lg'} overflow-hidden border-4 border-gray-200`}>
            <img
              src={preview}
              alt="Preview"
              className={`w-40 h-40 object-cover ${circular ? 'rounded-full' : ''}`}
            />
            <button
              onClick={handleRemove}
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
              type="button"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-3 p-2 bg-red-100 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Upload Button */}
      <button
        onClick={handleButtonClick}
        type="button"
        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200"
      >
        {label}
      </button>

      {/* Info Text */}
      <p className="text-sm text-gray-500 mt-2 text-center">
        Accepted formats: JPG, PNG, GIF (Max {maxSizeMB}MB)
      </p>
    </div>
  );
};

export default ImageUpload;
