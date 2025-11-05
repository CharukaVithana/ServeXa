import React, { useState, useRef } from 'react';
import { Camera, Edit2, X, Check, Mail, Phone } from 'lucide-react';

interface ProfileData {
  name: string;
  email: string;
  phone: string;
  avatar: string;
}

const ProfileHeader: React.FC = () => {
  const [profile, setProfile] = useState<ProfileData>({
    name: 'Alex Johnson',
    email: 'alex.johnson@servexa.com',
    phone: '(555) 123-4567',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex'
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<ProfileData>(profile);
  const [showImageMenu, setShowImageMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // API Configuration
  const API_BASE_URL = 'https://api.servexa.com'; // Replace with your actual API URL
  const USER_ID = '12345'; // This would come from authentication context

  // Fetch user profile on component mount
  React.useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/${USER_ID}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` // JWT token
        }
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(data);
      } else {
        console.error('Failed to fetch profile');
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    }
  };

  const handleEdit = () => {
    setEditData(profile);
    setIsEditing(true);
    setShowProfileMenu(false);
    setError(null);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/users/${USER_ID}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          name: editData.name,
          email: editData.email,
          phone: editData.phone,
          avatar: editData.avatar
        })
      });

      if (response.ok) {
        const updatedData = await response.json();
        setProfile(updatedData);
        setIsEditing(false);
        alert('Profile updated successfully!');
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to update profile');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Error updating profile:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditData(profile);
    setIsEditing(false);
  };

  const handleImageClick = () => {
    setShowImageMenu(!showImageMenu);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsSaving(true);
      
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('avatar', file);

      try {
        const response = await fetch(`${API_BASE_URL}/api/users/${USER_ID}/avatar`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: formData
        });

        if (response.ok) {
          const data = await response.json();
          const newAvatar = data.avatarUrl; // Assuming API returns the uploaded image URL
          setProfile({ ...profile, avatar: newAvatar });
          setEditData({ ...editData, avatar: newAvatar });
          alert('Profile picture updated successfully!');
        } else {
          alert('Failed to upload image');
        }
      } catch (err) {
        console.error('Error uploading image:', err);
        alert('Error uploading image. Please try again.');
      } finally {
        setIsSaving(false);
        setShowImageMenu(false);
      }
    }
  };

  const handleRemoveImage = async () => {
    setIsSaving(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/${USER_ID}/avatar`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const defaultAvatar = 'https://api.dicebear.com/7.x/avataaars/svg?seed=Default';
        setProfile({ ...profile, avatar: defaultAvatar });
        setEditData({ ...editData, avatar: defaultAvatar });
        alert('Profile picture removed successfully!');
      } else {
        alert('Failed to remove image');
      }
    } catch (err) {
      console.error('Error removing image:', err);
      alert('Error removing image. Please try again.');
    } finally {
      setIsSaving(false);
      setShowImageMenu(false);
    }
  };

  const handleSignOut = async () => {
    if (window.confirm('Are you sure you want to sign out?')) {
      try {
        await fetch(`${API_BASE_URL}/api/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        // Clear token and redirect
        localStorage.removeItem('token');
        alert('Signed out successfully!');
        window.location.href = '/login'; // Redirect to login page
      } catch (err) {
        console.error('Error signing out:', err);
        alert('Error signing out. Please try again.');
      }
    }
  };

  return (
    <div className="w-full bg-gray-800">
      {/* Navigation Bar */}
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center">
          <img 
            src="logo.png" 
            alt="Servexa Logo" 
            className="h-10"
          />
        </div>

        {/* Right Side - Profile & Sign Out */}
        <div className="flex items-center gap-4">
          {/* Profile Card */}
          <div className="relative">
            <div 
              className="bg-white rounded-lg px-4 py-2.5 flex items-center gap-3 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => setShowProfileMenu(!showProfileMenu)}
            >
              <img
                src={profile.avatar}
                alt={profile.name}
                className="w-10 h-10 rounded-full object-cover border-2 border-red-500"
              />
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-gray-900">{profile.name}</span>
                <span className="text-xs text-gray-500">{profile.email}</span>
              </div>
            </div>

            {/* Profile Dropdown Menu */}
            {showProfileMenu && (
              <div className="absolute top-full right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 py-2 w-64 z-50">
                <div className="px-4 py-3 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img
                        src={profile.avatar}
                        alt={profile.name}
                        className="w-12 h-12 rounded-full object-cover border-2 border-red-500"
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleImageClick();
                        }}
                        className="absolute -bottom-1 -right-1 bg-red-600 rounded-full p-1 hover:bg-red-700 transition-all shadow-lg text-white"
                      >
                        <Camera size={12} />
                      </button>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-gray-900">{profile.name}</span>
                      <span className="text-xs text-gray-500">{profile.email}</span>
                      <span className="text-xs text-gray-500">{profile.phone}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleEdit}
                  className="w-full px-4 py-2.5 text-left hover:bg-gray-50 transition-colors flex items-center gap-2 text-sm text-gray-700"
                >
                  <Edit2 size={16} />
                  Edit Profile
                </button>
              </div>
            )}

            {/* Image Upload Menu */}
            {showImageMenu && (
              <div className="absolute top-full right-0 mt-2 bg-white text-gray-800 rounded-lg shadow-xl border border-gray-200 py-2 w-48 z-50">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors flex items-center gap-2 text-sm"
                >
                  <Camera size={16} />
                  Upload Photo
                </button>
                <button
                  onClick={handleRemoveImage}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors flex items-center gap-2 text-red-600 text-sm"
                >
                  <X size={16} />
                  Remove Photo
                </button>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>

          {/* Sign Out Button */}
          <button 
            onClick={handleSignOut}
            className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm font-medium transition-colors"
          >
            Sign out
          </button>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Edit Profile</h2>
            
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}
            
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  value={editData.name}
                  onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500 transition-colors"
                  placeholder="Enter your name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={editData.email}
                  onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500 transition-colors"
                  placeholder="Enter your email"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                <input
                  type="tel"
                  value={editData.phone}
                  onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500 transition-colors"
                  placeholder="Enter your phone"
                />
              </div>
              <div className="flex gap-3 mt-4">
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex-1 px-4 py-2.5 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center justify-center gap-2 font-medium"
                >
                  {isSaving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check size={18} />
                      Save Changes
                    </>
                  )}
                </button>
                <button
                  onClick={handleCancel}
                  disabled={isSaving}
                  className="flex-1 px-4 py-2.5 bg-gray-500 hover:bg-gray-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center justify-center gap-2 font-medium"
                >
                  <X size={18} />
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Click outside to close menus */}
      {(showProfileMenu || showImageMenu) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowProfileMenu(false);
            setShowImageMenu(false);
          }}
        />
      )}
    </div>
  );
};

export default ProfileHeader;