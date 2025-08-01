import React, { useState } from "react";
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
} from "lucide-react";

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const mockUserData = {
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    phone: "+1 (555) 123-4567",
    bio: "Software developer with 5+ years of experience in web development.",
    location: "San Francisco, CA",
    company: "Tech Solutions Inc.",
    role: "Senior Developer",
    joinDate: "2023-01-15",
    timezone: "America/Los_Angeles",
    avatar: "",
  };

  const [formData, setFormData] = useState(
    process.env.NODE_ENV === "development"
      ? mockUserData
      : {
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          bio: "",
          location: "",
          company: "",
          role: "",
          joinDate: "",
          timezone: "",
          avatar: "",
        }
  );

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // await updateUserProfile(formData);
      // Remove when API ready
      setIsEditing(false);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-primary p-6 md:px-20">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link to="/dashboard">
            <button className="p-2 border rounded-md border-gray-800 text-white shadow">
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
          className={`flex items-center gap-2 px-4 py-2  rounded-md shadow border-gray-800  text-white ${
            isEditing ? "bg-gray-500" : "bg-blue-600"
          }`}
        >
          <Edit className="h-4 w-4" />
          {isEditing ? "Cancel" : "Edit Profile"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Overview */}
        <div className="bg-primary text-white p-6 border border-gray-800 rounded-lg shadow lg:col-span-1 text-center">
          <div className="relative mx-auto w-32 h-32 mb-4">
            {formData.avatar ? (
              <img
                src={formData.avatar}
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
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const imageUrl = URL.createObjectURL(file);
                      handleInputChange("avatar", imageUrl);
                    }
                  }}
                  id="avatarUpload"
                  style={{ display: "none" }}
                />
                <button
                  onClick={() =>
                    document.getElementById("avatarUpload").click()
                  }
                  type="button"
                  className="absolute bottom-0 right-0 p-1 bg-primary border-gray-800 text-white rounded-full shadow cursor-pointer"
                >
                  <Camera className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
          <h2 className="text-xl font-semibold">
            {formData.firstName} {formData.lastName}
          </h2>
          <p className="text-sm text-gray-500">
            {formData.role} at {formData.company}
          </p>
          <div className="mt-4 space-y-2 text-sm text-gray-600 text-left">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              {formData.email}
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              {formData.phone}
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              {formData.location}
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Joined {new Date(formData.joinDate).toLocaleDateString()}
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
                  First Name
                </label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) =>
                    handleInputChange("firstName", e.target.value)
                  }
                  disabled={!isEditing}
                  className="w-full border border-gray-800 text-white px-3 py-2 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) =>
                    handleInputChange("lastName", e.target.value)
                  }
                  disabled={!isEditing}
                  className="w-full border px-3 border-gray-800 text-white py-2 rounded-md"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                disabled={!isEditing}
                className="w-full border px-3 border-gray-800 text-white py-2 rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Phone</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                disabled={!isEditing}
                className="w-full border px-3 border-gray-800 text-white py-2 rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Bio</label>
              <textarea
                rows={4}
                value={formData.bio}
                onChange={(e) => handleInputChange("bio", e.target.value)}
                disabled={!isEditing}
                className="w-full border px-3 border-gray-800 text-white py-2 rounded-md"
              />
            </div>

            {/* Work Info */}
            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold mb-4">Work Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Company
                  </label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) =>
                      handleInputChange("company", e.target.value)
                    }
                    disabled={!isEditing}
                    className="w-full border border-gray-800 text-white px-3 py-2 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Role</label>
                  <input
                    type="text"
                    value={formData.role}
                    onChange={(e) => handleInputChange("role", e.target.value)}
                    disabled={!isEditing}
                    className="w-full border border-gray-800 text-white px-3 py-2 rounded-md"
                  />
                </div>
              </div>
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
                    onChange={(e) =>
                      handleInputChange("location", e.target.value)
                    }
                    disabled={!isEditing}
                    className="w-full border-gray-800 text-white border px-3 py-2 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Timezone
                  </label>
                  <select
                    value={formData.timezone}
                    onChange={(e) =>
                      handleInputChange("timezone", e.target.value)
                    }
                    disabled={!isEditing}
                    className="w-full border-gray-800 text-white border px-3 py-2 rounded-md"
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
                  </select>
                </div>
              </div>
            </div>

            {isEditing && (
              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md shadow"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 bg-gray-300 text-gray-800 py-2 px-4 rounded-md"
                >
                  Cancel
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
