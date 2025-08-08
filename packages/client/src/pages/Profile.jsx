import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
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
import {
  useGetUserByIdQuery,
  useUpdateCurrentUserMutation,
} from "../services/userApi.js";
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

  // Get current user ID from Redux auth state
  const { user: authUser } = useSelector((state) => state.auth);
  const currentUserId = authUser?.id;

  // Single API call to get all user data including companies
  const {
    data: userData,
    isLoading: isUserLoading,
    error: userError,
    refetch: refetchUser,
  } = useGetUserByIdQuery(currentUserId, {
    skip: !currentUserId, // Skip if no user ID available
  });

  const [updateProfile, { isLoading: isUpdating }] =
    useUpdateCurrentUserMutation();

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
    setFormData((prevFormData) => ({
      ...prevFormData,
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
      refetchUser(); // Refresh user data
    } catch (error) {
      const errorMessage =
        error?.data?.message ||
        error?.message ||
        "Failed to update profile. Please try again.";
      profileNotifications.profileUpdateError(errorMessage);
      console.error("Profile update error:", error);
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

  // Handle profile picture upload
  const handleProfilePictureUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        profileNotifications.profileUpdateError(
          "Please select a valid image file."
        );
        return;
      }

      // Validate file size (e.g., max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        profileNotifications.profileUpdateError(
          "Image size should be less than 5MB."
        );
        return;
      }

      const imageUrl = URL.createObjectURL(file);
      handleInputChange("profile_picture", imageUrl);
    }
  };

  // Determine loading state
  const isLoading = isUserLoading;

  // Determine error state
  const hasError = userError;

  // Show loading skeleton
  if (isLoading) {
    return <ProfileSkeleton />;
  }

  // Show error state
  if (hasError) {
    const errorMessage = userError?.message || "Failed to load profile";

    return (
      <div className="min-h-screen bg-primary p-6 md:px-20">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="text-red-400 mb-4 text-lg">{errorMessage}</div>
            <button
              onClick={() => refetchUser()}
              className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Ensure we have user data before rendering
  if (!userData?.data) {
    return (
      <div className="min-h-screen bg-primary p-6 md:px-20">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="text-gray-400 mb-4">No user data found</div>
            <button
              onClick={() => refetchUser()}
              className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
            >
              Reload
            </button>
          </div>
        </div>
      </div>
    );
  }

  const user = userData.data;
  const companies = userData.data.companies || [];
  const userDisplayName = formData.full_name || user.email || "User";
  const userRole = user.global_role || "User";
  const joinDate = user.created_at
    ? new Date(user.created_at).toLocaleDateString()
    : "Unknown";

  return (
    <div className="min-h-screen bg-primary p-6 md:px-20">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link to="/dashboard">
            <button
              className="p-2 border rounded-md border-gray-800 text-white shadow hover:bg-gray-800 transition-colors"
              aria-label="Go back to dashboard"
            >
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
          } ${isUpdating ? "opacity-50 cursor-not-allowed" : ""}`}
          aria-label={isEditing ? "Cancel editing" : "Edit profile"}
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
                alt={`${userDisplayName}'s profile picture`}
                className="w-full h-full rounded-full border border-gray-800 object-cover"
                onError={(e) => {
                  e.target.style.display = "none";
                  e.target.nextSibling.style.display = "flex";
                }}
              />
            ) : null}
            <div
              className={`w-full h-full flex items-center justify-center bg-gray-800 text-white rounded-full border border-gray-700 ${
                formData.profile_picture ? "hidden" : "flex"
              }`}
            >
              <User className="w-12 h-12" />
            </div>
            {isEditing && (
              <>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleProfilePictureUpload}
                  id="avatarUpload"
                  className="hidden"
                  aria-label="Upload profile picture"
                />
                <button
                  onClick={() =>
                    document.getElementById("avatarUpload")?.click()
                  }
                  type="button"
                  className="absolute bottom-0 right-0 p-1 bg-primary border-gray-800 text-white rounded-full shadow cursor-pointer hover:bg-gray-800 transition-colors"
                  aria-label="Change profile picture"
                >
                  <Camera className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
          <h2 className="text-xl font-semibold">{userDisplayName}</h2>
          <p className="text-sm text-gray-500 mb-4">{userRole}</p>
          <div className="space-y-2 text-sm text-gray-600 text-left">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{formData.email}</span>
            </div>
            {formData.phone && (
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 flex-shrink-0" />
                <span>{formData.phone}</span>
              </div>
            )}
            {formData.location && (
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 flex-shrink-0" />
                <span>{formData.location}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 flex-shrink-0" />
              <span>Joined {joinDate}</span>
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
                <label
                  htmlFor="fullName"
                  className="block text-sm font-medium mb-1"
                >
                  Full Name
                </label>
                <input
                  id="fullName"
                  type="text"
                  value={formData.full_name}
                  onChange={(e) =>
                    handleInputChange("full_name", e.target.value)
                  }
                  disabled={!isEditing}
                  className="w-full border border-gray-800 text-white px-3 py-2 rounded-md bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="Enter your full name"
                />
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium mb-1"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  disabled={!isEditing}
                  className="w-full border px-3 border-gray-800 text-white py-2 rounded-md bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium mb-1">
                Phone
              </label>
              <input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                disabled={!isEditing}
                placeholder="+1 (555) 123-4567"
                className="w-full border px-3 border-gray-800 text-white py-2 rounded-md bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            <div>
              <label htmlFor="bio" className="block text-sm font-medium mb-1">
                Bio
              </label>
              <textarea
                id="bio"
                rows={4}
                value={formData.bio}
                onChange={(e) => handleInputChange("bio", e.target.value)}
                disabled={!isEditing}
                placeholder="Tell us about yourself..."
                className="w-full border px-3 border-gray-800 text-white py-2 rounded-md bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed resize-vertical"
                maxLength={500}
              />
            </div>

            {/* Location */}
            <div className="border-t border-gray-800 pt-4">
              <h3 className="text-lg font-semibold mb-4">
                Location & Preferences
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="location"
                    className="block text-sm font-medium mb-1"
                  >
                    Location
                  </label>
                  <input
                    id="location"
                    type="text"
                    value={formData.location}
                    onChange={(e) =>
                      handleInputChange("location", e.target.value)
                    }
                    disabled={!isEditing}
                    placeholder="San Francisco, CA"
                    className="w-full border-gray-800 text-white border px-3 py-2 rounded-md bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
                <div>
                  <label
                    htmlFor="timezone"
                    className="block text-sm font-medium mb-1"
                  >
                    Timezone
                  </label>
                  <select
                    id="timezone"
                    value={formData.timezone}
                    onChange={(e) =>
                      handleInputChange("timezone", e.target.value)
                    }
                    disabled={!isEditing}
                    className="w-full border-gray-800 text-white border px-3 py-2 rounded-md bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="America/Los_Angeles">
                      Pacific Time (PT)
                    </option>
                    <option value="America/Denver">Mountain Time (MT)</option>
                    <option value="America/Chicago">Central Time (CT)</option>
                    <option value="America/New_York">Eastern Time (ET)</option>
                    <option value="Europe/London">
                      Greenwich Mean Time (GMT)
                    </option>
                    <option value="Europe/Paris">
                      Central European Time (CET)
                    </option>
                    <option value="Asia/Tokyo">
                      Japan Standard Time (JST)
                    </option>
                    <option value="Asia/Shanghai">
                      China Standard Time (CST)
                    </option>
                    <option value="Australia/Sydney">
                      Australian Eastern Time (AET)
                    </option>
                  </select>
                </div>
              </div>
            </div>

            {isEditing && (
              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md shadow hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
                  className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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

        <div className="my-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {companies.map((companyUser, index) => (
              <CompanyCard
                key={companyUser.id || index}
                company={companyUser}
                role={companyUser.role}
                joinDate={companyUser.created_at}
                isPrimary={index === 0}
              />
            ))}
          </div>
        </div>

        <AddFirstCompany />
      </div>
    </div>
  );
};

export default Profile;
