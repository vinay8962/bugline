import React, { useState } from "react";
import { X, FolderPlus, Building2 } from "lucide-react";
import { useCreateProjectMutation } from "../services/projectApi.js";
import { profileNotifications } from "../utils/notifications.jsx";
import LoadingSpinner from "./LoadingSpinner.jsx";

const CreateProject = ({ onClose, companyId, companyName, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
  });

  const [createProject, { isLoading }] = useCreateProjectMutation();

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Auto-generate slug when name changes
    if (field === "name" && !formData.slug) {
      setFormData((prev) => ({
        ...prev,
        slug: value
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9-]/g, ""),
      }));
    }
  };

  // const handleSubmit = async (e) => {
  //   e.preventDefault();

  //   try {
  //     await createProject({ companyId, projectData: formData }).unwrap();
  //     profileNotifications.projectAdded();
  //     onSuccess && onSuccess();
  //     onClose();
  //   } catch (error) {
  //     const errorMessage =
  //       error?.data?.message || error?.message || "Failed to create project";
  //     profileNotifications.projectAddError(errorMessage);
  //   }
  // };
  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("=== CREATE PROJECT DEBUG ===");
    console.log("Form data:", formData);
    console.log("Company ID:", companyId);

    try {
      console.log("Calling createProject API...");
      const res = await createProject({
        companyId,
        projectData: formData,
      }).unwrap();

      console.log("API Response:", res);

      // Check different possible success conditions
      if (res.success || res.data || res.id || res.status === "success") {
        console.log("Success detected, calling callbacks...");

        try {
          profileNotifications.projectAdded();
          console.log("Notification sent");
        } catch (notifError) {
          console.error("Notification error:", notifError);
        }

        try {
          if (onSuccess) {
            console.log("Calling onSuccess...");
            onSuccess();
          }
        } catch (successError) {
          console.error("onSuccess error:", successError);
        }

        try {
          console.log("Calling onClose...");
          onClose();
        } catch (closeError) {
          console.error("onClose error:", closeError);
        }
      } else {
        console.log("Success condition not met, response:", res);
        throw new Error(res.message || "Failed to create project");
      }
    } catch (error) {
      console.error("Create project error:", error);
      profileNotifications.projectAddError(
        error?.data?.message || error?.message || "Failed to create project"
      );
    }
  };
  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-primary text-white rounded-lg border border-gray-800 shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <FolderPlus className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Create New Project</h2>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Building2 className="w-4 h-4" />
                <span>{companyName}</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Project Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              required
              placeholder="Enter project name"
              className="w-full border border-gray-800 text-white px-3 py-2 rounded-md bg-gray-900 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Project Slug *
            </label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) =>
                handleInputChange(
                  "slug",
                  e.target.value
                    .toLowerCase()
                    .replace(/\s+/g, "-")
                    .replace(/[^a-z0-9-]/g, "")
                )
              }
              required
              placeholder="project-slug"
              className="w-full border border-gray-800 text-white px-3 py-2 rounded-md bg-gray-900 focus:border-blue-500 focus:outline-none"
            />
            <p className="text-xs text-gray-400 mt-1">
              This will be used in your project URL. Use only letters, numbers,
              and hyphens.
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={isLoading || !formData.name || !formData.slug}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <LoadingSpinner size="sm" />
              ) : (
                <FolderPlus className="w-4 h-4" />
              )}
              {isLoading ? "Creating..." : "Create Project"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-600 text-gray-300 rounded-md hover:bg-gray-800 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProject;
