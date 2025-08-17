import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
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
  Plus,
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

// Constants to prevent recreation on each render
const INITIAL_FORM_DATA = {
  full_name: "",
  email: "",
  phone: "",
  bio: "",
  location: "",
  timezone: "America/Los_Angeles",
  profile_picture: "",
};

const TIMEZONE_OPTIONS = [
  { value: "America/Los_Angeles", label: "Pacific Time (PT)" },
  { value: "America/Denver", label: "Mountain Time (MT)" },
  { value: "America/Chicago", label: "Central Time (CT)" },
  { value: "America/New_York", label: "Eastern Time (ET)" },
  { value: "Europe/London", label: "Greenwich Mean Time (GMT)" },
  { value: "Europe/Paris", label: "Central European Time (CET)" },
  { value: "Asia/Tokyo", label: "Japan Standard Time (JST)" },
  { value: "Asia/Shanghai", label: "China Standard Time (CST)" },
  { value: "Australia/Sydney", label: "Australian Eastern Time (AET)" },
];

const Profile = () => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);

  // Memoized selector to prevent unnecessary re-renders
  const authUser = useSelector(useCallback((state) => state.auth.user, []));
  const currentUserId = useMemo(() => authUser?.id, [authUser?.id]);

  // Single API call to get all user data including companies
  const {
    data: userData,
    isLoading: isUserLoading,
    error: userError,
    refetch: refetchUser,
  } = useGetUserByIdQuery(currentUserId, {
    skip: !currentUserId,
    refetchOnMountOrArgChange: false,
    refetchOnFocus: false,
  });

  const [updateProfile, { isLoading: isUpdating }] =
    useUpdateCurrentUserMutation();

  // Memoized user data extraction
  const user = useMemo(() => userData?.data, [userData?.data]);
  const companies = useMemo(
    () => userData?.data?.companies || [],
    [userData?.data?.companies]
  );

  // Memoized computed values
  const userDisplayName = useMemo(
    () => formData.full_name || user?.email || "User",
    [formData.full_name, user?.email]
  );

  const userRole = useMemo(
    () => user?.global_role || "User",
    [user?.global_role]
  );

  const joinDate = useMemo(
    () =>
      user?.created_at
        ? new Date(user.created_at).toLocaleDateString()
        : "Unknown",
    [user?.created_at]
  );

  // Initialize form data when user data is loaded
  useEffect(() => {
    if (user) {
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
  }, [user]);

  // Memoized event handlers
  const handleInputChange = useCallback((field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      try {
        await updateProfile(formData).unwrap();
        profileNotifications.profileUpdated();
        setIsEditing(false);
        refetchUser();
      } catch (error) {
        const errorMessage =
          error?.data?.message ||
          error?.message ||
          "Failed to update profile. Please try again.";
        profileNotifications.profileUpdateError(errorMessage);
        console.error("Profile update error:", error);
      }
    },
    [formData, updateProfile, refetchUser]
  );

  const handleCancel = useCallback(() => {
    if (user) {
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
  }, [user]);

  const handleProfilePictureUpload = useCallback(
    (e) => {
      const file = e.target.files?.[0];
      if (file) {
        if (!file.type.startsWith("image/")) {
          profileNotifications.profileUpdateError(
            "Please select a valid image file."
          );
          return;
        }

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
    },
    [handleInputChange]
  );

  const toggleEditing = useCallback(() => {
    setIsEditing((prev) => !prev);
  }, []);

  const navigateToAddCompany = useCallback(() => {
    navigate("/add-company");
  }, [navigate]);

  // Memoized loading and error states
  const isLoading = useMemo(() => isUserLoading, [isUserLoading]);
  const hasError = useMemo(() => !!userError, [userError]);

  // Early returns for loading and error states
  if (isLoading) {
    return <ProfileSkeleton />;
  }

  if (hasError) {
    const errorMessage = userError?.message || "Failed to load profile";
    return <ErrorState errorMessage={errorMessage} onRetry={refetchUser} />;
  }

  if (!user) {
    return <NoDataState onReload={refetchUser} />;
  }

  console.log("User Data:", user);

  return (
    <div className="min-h-screen bg-primary p-6 md:px-20">
      {/* Header */}
      <ProfileHeader
        isEditing={isEditing}
        isUpdating={isUpdating}
        onToggleEditing={toggleEditing}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Overview */}
        <ProfileOverview
          formData={formData}
          userDisplayName={userDisplayName}
          userRole={userRole}
          joinDate={joinDate}
          isEditing={isEditing}
          onProfilePictureUpload={handleProfilePictureUpload}
        />

        {/* Profile Form */}
        <ProfileForm
          formData={formData}
          isEditing={isEditing}
          isUpdating={isUpdating}
          onInputChange={handleInputChange}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </div>

      {/* Company Information */}
      <CompanySection
        companies={companies}
        onNavigateToAddCompany={navigateToAddCompany}
      />
    </div>
  );
};

// Memoized sub-components
const ProfileHeader = React.memo(
  ({ isEditing, isUpdating, onToggleEditing }) => (
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
        onClick={onToggleEditing}
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
  )
);

const ProfileOverview = React.memo(
  ({
    formData,
    userDisplayName,
    userRole,
    joinDate,
    isEditing,
    onProfilePictureUpload,
  }) => {
    const handleAvatarUploadClick = useCallback(() => {
      document.getElementById("avatarUpload")?.click();
    }, []);

    const handleImageError = useCallback((e) => {
      e.target.style.display = "none";
      e.target.nextSibling.style.display = "flex";
    }, []);

    return (
      <div className="bg-primary text-white p-6 border border-gray-800 rounded-lg shadow lg:col-span-1 text-center">
        <div className="relative mx-auto w-32 h-32 mb-4">
          {formData.profile_picture && (
            <img
              src={formData.profile_picture}
              alt={`${userDisplayName}'s profile picture`}
              className="w-full h-full rounded-full border border-gray-800 object-cover"
              onError={handleImageError}
            />
          )}
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
                onChange={onProfilePictureUpload}
                id="avatarUpload"
                className="hidden"
                aria-label="Upload profile picture"
              />
              <button
                onClick={handleAvatarUploadClick}
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
    );
  }
);

const ProfileForm = React.memo(
  ({ formData, isEditing, isUpdating, onInputChange, onSubmit, onCancel }) => {
    const handleFieldChange = useCallback(
      (field) => (e) => {
        onInputChange(field, e.target.value);
      },
      [onInputChange]
    );

    return (
      <div className="bg-primary text-white p-6 rounded-lg border border-gray-800 shadow lg:col-span-2">
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="text-xl font-semibold flex items-center gap-2 mb-2">
            <User className="w-5 h-5" />
            Profile Information
          </div>

          {/* Personal Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              id="fullName"
              label="Full Name"
              type="text"
              value={formData.full_name}
              onChange={handleFieldChange("full_name")}
              disabled={!isEditing}
              placeholder="Enter your full name"
            />
            <FormField
              id="email"
              label="Email"
              type="email"
              value={formData.email}
              onChange={handleFieldChange("email")}
              disabled={!isEditing}
              placeholder="Enter your email"
            />
          </div>

          <FormField
            id="phone"
            label="Phone"
            type="tel"
            value={formData.phone}
            onChange={handleFieldChange("phone")}
            disabled={!isEditing}
            placeholder="+1 (555) 123-4567"
          />

          <FormTextArea
            id="bio"
            label="Bio"
            value={formData.bio}
            onChange={handleFieldChange("bio")}
            disabled={!isEditing}
            placeholder="Tell us about yourself..."
            rows={4}
            maxLength={500}
          />

          {/* Location */}
          <div className="border-t border-gray-800 pt-4">
            <h3 className="text-lg font-semibold mb-4">
              Location & Preferences
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                id="location"
                label="Location"
                type="text"
                value={formData.location}
                onChange={handleFieldChange("location")}
                disabled={!isEditing}
                placeholder="San Francisco, CA"
              />
              <FormSelect
                id="timezone"
                label="Timezone"
                value={formData.timezone}
                onChange={handleFieldChange("timezone")}
                disabled={!isEditing}
                options={TIMEZONE_OPTIONS}
              />
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
                onClick={onCancel}
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
    );
  }
);

const FormField = React.memo(
  ({ id, label, type, value, onChange, disabled, placeholder }) => (
    <div>
      <label htmlFor={id} className="block text-sm font-medium mb-1">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className="w-full border border-gray-800 text-white px-3 py-2 rounded-md bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
        placeholder={placeholder}
      />
    </div>
  )
);

const FormTextArea = React.memo(
  ({ id, label, value, onChange, disabled, placeholder, rows, maxLength }) => (
    <div>
      <label htmlFor={id} className="block text-sm font-medium mb-1">
        {label}
      </label>
      <textarea
        id={id}
        rows={rows}
        value={value}
        onChange={onChange}
        disabled={disabled}
        placeholder={placeholder}
        className="w-full border px-3 border-gray-800 text-white py-2 rounded-md bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed resize-vertical"
        maxLength={maxLength}
      />
    </div>
  )
);

const FormSelect = React.memo(
  ({ id, label, value, onChange, disabled, options }) => (
    <div>
      <label htmlFor={id} className="block text-sm font-medium mb-1">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className="w-full border-gray-800 text-white border px-3 py-2 rounded-md bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
);

const CompanySection = React.memo(({ companies, onNavigateToAddCompany }) => (
  <div className="mt-8">
    <div className="flex items-center gap-2 mb-6">
      <Building2 className="w-5 h-5 text-white" />
      <h2 className="text-2xl font-bold text-white">Companies</h2>
    </div>

    <div className="my-10">
      {companies.length === 0 ? (
        <AddFirstCompany />
      ) : (
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
          <AddCompanyCard onNavigate={onNavigateToAddCompany} />
        </div>
      )}
    </div>
  </div>
));

const AddCompanyCard = React.memo(({ onNavigate }) => (
  <div>
    <div
      onClick={onNavigate}
      className="bg-gray-800/0 border-2 border-dashed border-gray-600 rounded-lg p-6 hover:border-blue-500 hover:bg-gray-750 transition-all cursor-pointer group min-h-[200px] flex flex-col items-center justify-center"
    >
      <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
        <Plus className="w-6 h-6 text-white" />
      </div>
      <h3 className="text-white font-semibold text-lg mb-2">Add Company</h3>
      <p className="text-gray-400 text-sm text-center">
        Join an existing company or create a new one
      </p>
    </div>
  </div>
));

const ErrorState = React.memo(({ errorMessage, onRetry }) => (
  <div className="min-h-screen bg-primary p-6 md:px-20">
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <div className="text-red-400 mb-4 text-lg">{errorMessage}</div>
        <button
          onClick={onRetry}
          className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  </div>
));

const NoDataState = React.memo(({ onReload }) => (
  <div className="min-h-screen bg-primary p-6 md:px-20">
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <div className="text-gray-400 mb-4">No user data found</div>
        <button
          onClick={onReload}
          className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
        >
          Reload
        </button>
      </div>
    </div>
  </div>
));

Profile.displayName = "Profile";

export default Profile;
