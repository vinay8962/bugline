import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Edit,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Camera,
  User,
  Save,
  X,
  Building2,
} from "lucide-react";
import { useGetCurrentUserQuery, useUpdateCurrentUserMutation } from "../services/userApi.js";
import { profileNotifications } from "../utils/notifications.jsx";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import ProfileSkeleton from "../components/ProfileSkeleton.jsx";
import CompanyCard from "../components/CompanyCard.jsx";
import AddFirstCompany from "../components/AddFirstCompany.jsx";

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    bio: "",
    location: "",
    timezone: "America/Los_Angeles",
    profile_picture: "",
  });

  // RTK Query hooks
  const { 
    data: userData, 
    isLoading, 
    error, 
    refetch 
  } = useGetCurrentUserQuery();
  
  const [updateProfile, { isLoading: isUpdating }] = useUpdateCurrentUserMutation();

  // Initialize form data when user data is loaded
  useEffect(() => {
    if (userData?.data) {
      const user = userData.data;
      setFormData({
        full_name: user.full_name || "",
        email: user.email || "",
        phone: user.phone || "",
        bio: user.bio || "",
        location: user.location || "",
        timezone: user.timezone || "America/Los_Angeles",
        profile_picture: user.profile_picture || "",
      });
    }
  }, [userData]);

  // Handle form input changes
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await updateProfile(formData).unwrap();
      profileNotifications.profileUpdated();
      setIsEditing(false);
      refetch(); // Refresh user data
    } catch (error) {
      const errorMessage = error?.data?.message || error?.message || 'Failed to update profile';
      profileNotifications.profileUpdateError(errorMessage);
    }
  };

  // Handle cancel edit
  const handleCancel = () => {
    // Reset form data to original values
    if (userData?.data) {
      const user = userData.data;
      setFormData({
        full_name: user.full_name || "",
        email: user.email || "",
        phone: user.phone || "",
        bio: user.bio || "",
        location: user.location || "",
        timezone: user.timezone || "America/Los_Angeles",
        profile_picture: user.profile_picture || "",
      });
    }
    setIsEditing(false);
  };

  // Handle profile picture upload (mock for now)
  const handleProfilePictureUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      handleInputChange("profile_picture", imageUrl);
    }
  };

  // Show loading skeleton
  if (isLoading) {
    return <ProfileSkeleton />;
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-primary p-6 md:px-20">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="text-red-400 mb-4">Failed to load profile</div>
            <button 
              onClick={() => refetch()}
              className="bg-blue-600 text-white px-4 py-2 rounded-md"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const user = userData?.data;
  const companies = user?.company_users || [];

  return (
    <div className="min-h-screen bg-primary p-6 md:px-20">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link to="/dashboard">
            <button className="p-2 border rounded-md border-gray-800 text-white shadow hover:bg-gray-800 transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-white">User Profile</h1>
            <p className="text-gray-500">
              Manage your account settings and preferences
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsEditing(!isEditing)}
          disabled={isUpdating}
          className={`flex items-center gap-2 px-4 py-2 rounded-md shadow border-gray-800 text-white transition-colors ${
            isEditing 
              ? "bg-gray-600 hover:bg-gray-700" 
              : "bg-blue-600 hover:bg-blue-700"
          } ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isUpdating ? (
            <LoadingSpinner size="sm" />
          ) : (
            <Edit className="h-4 w-4" />
          )}
          {isEditing ? "Cancel" : "Edit Profile"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Overview */}
        <div className="bg-primary text-white p-6 border border-gray-800 rounded-lg shadow lg:col-span-1 text-center">
          <div className="relative mx-auto w-32 h-32 mb-4">
            {formData.profile_picture ? (
              <img
                src={formData.profile_picture}
                alt="avatar"
                className="w-full h-full rounded-full border border-gray-800 object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-800 text-white rounded-full border border-gray-700">
                <User className="w-12 h-12" />
              </div>
            )}
            {isEditing && (
              <>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleProfilePictureUpload}
                  id="avatarUpload"
                  style={{ display: "none" }}
                />
                <button
                  onClick={() => document.getElementById("avatarUpload").click()}
                  type="button"
                  className="absolute bottom-0 right-0 p-1 bg-primary border-gray-800 text-white rounded-full shadow cursor-pointer hover:bg-gray-800 transition-colors"
                >
                  <Camera className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
          <h2 className="text-xl font-semibold">
            {formData.full_name || "No Name Set"}
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            {user?.global_role || "User"}
          </p>
          <div className="space-y-2 text-sm text-gray-600 text-left">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              {formData.email}
            </div>
            {formData.phone && (
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                {formData.phone}
              </div>
            )}
            {formData.location && (
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                {formData.location}
              </div>
            )}
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Joined {new Date(user?.created_at).toLocaleDateString()}
            </div>
          </div>
        </div>

        {/* Profile Form */}
        <div className="bg-primary text-white p-6 rounded-lg border border-gray-800 shadow lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="text-xl font-semibold flex items-center gap-2 mb-2">
              <User className="w-5 h-5" />
              Profile Information
            </div>

            {/* Personal Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => handleInputChange("full_name", e.target.value)}
                  disabled={!isEditing}
                  className="w-full border border-gray-800 text-white px-3 py-2 rounded-md bg-gray-900 disabled:opacity-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  disabled={!isEditing}
                  className="w-full border px-3 border-gray-800 text-white py-2 rounded-md bg-gray-900 disabled:opacity-50"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Phone</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                disabled={!isEditing}
                placeholder="+1 (555) 123-4567"
                className="w-full border px-3 border-gray-800 text-white py-2 rounded-md bg-gray-900 disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Bio</label>
              <textarea
                rows={4}
                value={formData.bio}
                onChange={(e) => handleInputChange("bio", e.target.value)}
                disabled={!isEditing}
                placeholder="Tell us about yourself..."
                className="w-full border px-3 border-gray-800 text-white py-2 rounded-md bg-gray-900 disabled:opacity-50"
              />
            </div>

            {/* Location */}
            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold mb-4">
                Location & Preferences
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => handleInputChange("location", e.target.value)}
                    disabled={!isEditing}
                    placeholder="San Francisco, CA"
                    className="w-full border-gray-800 text-white border px-3 py-2 rounded-md bg-gray-900 disabled:opacity-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Timezone
                  </label>
                  <select
                    value={formData.timezone}
                    onChange={(e) => handleInputChange("timezone", e.target.value)}
                    disabled={!isEditing}
                    className="w-full border-gray-800 text-white border px-3 py-2 rounded-md bg-gray-900 disabled:opacity-50"
                  >
                    <option value="America/Los_Angeles">Pacific Time (PT)</option>
                    <option value="America/Denver">Mountain Time (MT)</option>
                    <option value="America/Chicago">Central Time (CT)</option>
                    <option value="America/New_York">Eastern Time (ET)</option>
                    <option value="Europe/London">Greenwich Mean Time (GMT)</option>
                    <option value="Europe/Paris">Central European Time (CET)</option>
                    <option value="Asia/Tokyo">Japan Standard Time (JST)</option>
                  </select>
                </div>
              </div>
            </div>

            {isEditing && (
              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md shadow hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isUpdating ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {isUpdating ? "Saving..." : "Save Changes"}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={isUpdating}
                  className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Company Information */}
      <div className="mt-8">
        <div className="flex items-center gap-2 mb-6">
          <Building2 className="w-5 h-5 text-white" />
          <h2 className="text-2xl font-bold text-white">Companies</h2>
        </div>
        
        {companies.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {companies.map((companyUser, index) => (
              <CompanyCard
                key={companyUser.id}
                company={companyUser.company}
                role={companyUser.role}
                joinDate={companyUser.created_at}
                isPrimary={index === 0}
              />
            ))}
          </div>
        ) : (
          <AddFirstCompany />
        )}
      </div>
    </div>
  );
};

export default Profile;
