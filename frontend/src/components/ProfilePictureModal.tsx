import React, { useState, useRef, useCallback } from 'react';
import { FaTimes, FaUpload, FaTrash } from 'react-icons/fa';

interface ProfilePictureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (imageUrl: string | null) => void; // Allow saving null to remove picture
  currentImageUrl: string | null | undefined;
}

const ProfilePictureModal: React.FC<ProfilePictureModalProps> = ({ isOpen, onClose, onSave, currentImageUrl }) => {
  const [imagePreview, setImagePreview] = useState<string | null>(currentImageUrl || null);
  const [isUploading, setIsUploading] = useState(false); // Basic loading state
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setIsUploading(true);
    // Simulate upload process
    await new Promise(resolve => setTimeout(resolve, 1000)); 
    onSave(imagePreview); // Pass the new image URL (or null) to the parent
    setIsUploading(false);
    onClose();
  };

  const handleRemove = () => {
    setImagePreview(null);
    // Optionally trigger save immediately or wait for explicit save
    // onSave(null); 
    // onClose();
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md m-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Edit Profile Picture</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <FaTimes size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 text-center">
          <div 
            className="mx-auto w-48 h-48 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center mb-4 overflow-hidden bg-gray-100 cursor-pointer hover:border-red-500"
            onClick={triggerFileSelect}
            title="Click to upload image"
          >
            {imagePreview ? (
              <img src={imagePreview} alt="Profile preview" className="w-full h-full object-cover" />
            ) : (
              <div className="text-gray-400">
                <FaUpload size={40} />
                <p className="mt-2 text-sm">Click to upload</p>
              </div>
            )}
          </div>
          <input 
            ref={fileInputRef} 
            id="profile-picture-upload" 
            type="file" 
            className="sr-only" 
            accept="image/*" 
            onChange={handleImageChange} 
          />
          {imagePreview && (
             <button 
                onClick={handleRemove} 
                className="mt-2 text-sm text-red-600 hover:underline flex items-center justify-center gap-1 mx-auto"
              >
               <FaTrash /> Remove Picture
             </button>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-4 bg-gray-50 border-t">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
            Cancel
          </button>
          <button 
            type="button" 
            onClick={handleSave} 
            disabled={isUploading} 
            className={`px-4 py-2 text-sm font-medium text-white bg-[#D72638] rounded-md hover:bg-red-700 disabled:bg-gray-400`}
          >
            {isUploading ? 'Saving...' : 'Save Picture'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePictureModal;