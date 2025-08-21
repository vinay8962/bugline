import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Building2, Save } from "lucide-react";
import { useCreateCompanyMutation } from "../services/companyApi.js";
import { profileNotifications } from "../utils/notifications.jsx";
import LoadingSpinner from "./LoadingSpinner.jsx";
import { secureStorage } from "../utils/encryption.js";

const AddCompany = () => {
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
  });

  const navigate = useNavigate();
  const [createCompany, { isLoading }] = useCreateCompanyMutation();

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  console.log("Current form data:", formData);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const result = await createCompany(formData).unwrap();
      profileNotifications.companyAdded();

      // Set flag for other components to detect company creation
      localStorage.setItem("company_created", "true");

      // Update secureStorage with new company information
      // This is crucial for useAuthStatus hook to detect the new company
      if (result.data?.id) {
        secureStorage.setItem("companyId", result.data.id);
        secureStorage.setItem("companyRole", "ADMIN"); // Creator becomes admin

        // Dispatch custom event to notify useAuthStatus hook
        window.dispatchEvent(new Event("secureStorageChange"));

        console.log("🔑 Updated secureStorage with new company:", {
          companyId: result.data.id,
          companyRole: "ADMIN",
        });
      }

      // Add a small delay to ensure cache invalidation completes
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Navigate using React Router for proper state management
      // This ensures cache invalidation happens and dashboard updates
      navigate("/dashboard", {
        replace: true,
        state: { newCompanyCreated: true, companyId: result.data?.id },
      });
    } catch (error) {
      const errorMessage =
        error?.data?.message || error?.message || "Failed to create company";
      profileNotifications.companyAddError(errorMessage);
    }
  };

  return (
    <div className="min-h-screen bg-primary text-white">
      {/* Enhanced Header */}
      <header className="bg-primary border-b border-slate-700/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center space-x-4">
            <Link to="/profile">
              <button className="p-3 border border-slate-600/50 rounded-xl text-white shadow-lg hover:bg-slate-700/50 transition-all duration-200 hover:border-slate-500/50">
                <ArrowLeft className="w-5 h-5" />
              </button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Create Company
              </h1>
              <p className="text-slate-400">
                Set up your first company to start managing bugs and projects
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-8 backdrop-blur-sm shadow-xl">
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">
                Company Information
              </h2>
              <p className="text-slate-400">
                Fill in the details to create your company
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-sm font-semibold text-white mb-3">
                  Company Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  required
                  placeholder="Enter your company name"
                  className="w-full border border-slate-600/50 text-white px-4 py-3 rounded-xl bg-slate-700/50 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 placeholder-slate-400"
                />
                <p className="text-xs text-slate-400 mt-2">
                  This will be displayed as your company's name throughout the
                  system
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-white mb-3">
                  Company Slug *
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) =>
                    handleInputChange(
                      "slug",
                      e.target.value.toLowerCase().replace(/\s+/g, "-")
                    )
                  }
                  required
                  placeholder="company-slug"
                  className="w-full border border-slate-600/50 text-white px-4 py-3 rounded-xl bg-slate-700/50 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 placeholder-slate-400"
                />
                <p className="text-xs text-slate-400 mt-2">
                  This will be used in your company URL. Use only letters,
                  numbers, and hyphens.
                </p>
              </div>
            </div>

            {/* Company Preview */}
            {formData.name && formData.slug && (
              <div className="bg-slate-700/30 rounded-xl p-6 border border-slate-600/30">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Company Preview
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="text-sm text-slate-400 mb-2">
                      Company Name
                    </div>
                    <div className="text-white font-medium">
                      {formData.name}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-400 mb-2">
                      Company Slug
                    </div>
                    <div className="text-blue-400 font-mono">
                      /{formData.slug}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <button
                type="submit"
                disabled={isLoading || !formData.name || !formData.slug}
                className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-xl shadow-lg hover:bg-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3 font-medium"
              >
                {isLoading ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <Save className="w-5 h-5" />
                )}
                <span>{isLoading ? "Creating..." : "Create Company"}</span>
              </button>
              <Link
                to="/profile"
                className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-3 px-6 rounded-xl transition-all duration-200 flex items-center justify-center font-medium border border-slate-600/50"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>

        {/* Additional Info */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center space-x-2 text-slate-400 text-sm">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span>
              You'll be automatically assigned as an Admin of this company
            </span>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AddCompany;
