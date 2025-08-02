import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Building2, Save } from "lucide-react";
import { useCreateCompanyMutation } from "../services/companyApi.js";
import { profileNotifications } from "../utils/notifications.jsx";
import LoadingSpinner from "./LoadingSpinner.jsx";

const AddCompany = () => {
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
  });

  const [createCompany, { isLoading }] = useCreateCompanyMutation();

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await createCompany(formData).unwrap();
      profileNotifications.companyAdded();
      // Redirect to dashboard or profile
      window.location.href = "/profile";
    } catch (error) {
      const errorMessage = error?.data?.message || error?.message || 'Failed to create company';
      profileNotifications.companyAddError(errorMessage);
    }
  };

  return (
    <div className="min-h-screen bg-primary p-6 md:px-20">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link to="/profile">
            <button className="p-2 border rounded-md border-gray-800 text-white shadow hover:bg-gray-800 transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-white">Create Company</h1>
            <p className="text-gray-500">
              Set up your first company to start managing bugs
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto">
        <div className="bg-primary text-white p-6 rounded-lg border border-gray-800 shadow">
          <div className="flex items-center gap-2 mb-6">
            <Building2 className="w-6 h-6 text-blue-500" />
            <h2 className="text-xl font-semibold">Company Information</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                Company Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                required
                placeholder="Enter your company name"
                className="w-full border border-gray-800 text-white px-3 py-2 rounded-md bg-gray-900 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Company Slug *
              </label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => handleInputChange("slug", e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                required
                placeholder="company-slug"
                className="w-full border border-gray-800 text-white px-3 py-2 rounded-md bg-gray-900 focus:border-blue-500 focus:outline-none"
              />
              <p className="text-xs text-gray-400 mt-1">
                This will be used in your company URL. Use only letters, numbers, and hyphens.
              </p>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={isLoading || !formData.name || !formData.slug}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md shadow hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {isLoading ? "Creating..." : "Create Company"}
              </button>
              <Link
                to="/profile"
                className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors flex items-center justify-center"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddCompany;
