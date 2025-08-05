import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCreateEmployeeMutation } from "../../services/userApi.js";
import { useAuthStatus } from "../../hooks/useAuth.js";
import { COMPANY_ROLES } from "@bugline/shared";

const backdrop = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const modal = {
  hidden: { scale: 0, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { type: "spring", stiffness: 200, damping: 20 },
  },
  exit: {
    scale: 0,
    opacity: 0,
    transition: { duration: 0.3 },
  },
};

const AddEmployee = ({ onClose, companyId }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "",
    password: "",
    confirmPassword: ""
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Get auth context and create employee mutation
  const { companyId: authCompanyId } = useAuthStatus();
  const [createEmployee] = useCreateEmployeeMutation();
  
  // Use passed companyId or fall back to auth companyId
  const currentCompanyId = companyId || authCompanyId;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Phone validation
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\+?[\d\s\-\(\)]{10,}$/.test(formData.phone)) {
      newErrors.phone = "Please enter a valid phone number";
    }

    // Role validation
    if (!formData.role) {
      newErrors.role = "Please select a role";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = "Password must contain at least one uppercase letter, one lowercase letter, and one number";
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (!currentCompanyId) {
      setErrors({ submit: "Company information is missing. Please try again." });
      return;
    }

    setIsSubmitting(true);

    try {
      // Create employee data
      const employeeData = {
        companyId: currentCompanyId,
        full_name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        password: formData.password,
        role: formData.role,
      };

      console.log("Creating employee:", employeeData);
      
      // Call API to create employee
      const result = await createEmployee(employeeData).unwrap();
      
      if (result.success) {
        // Success - close modal
        onClose();
      } else {
        setErrors({ submit: result.message || "Failed to create employee. Please try again." });
      }
    } catch (error) {
      console.error("Error creating employee:", error);
      
      // Handle different error types
      if (error?.data?.message) {
        setErrors({ submit: error.data.message });
      } else if (error?.message) {
        setErrors({ submit: error.message });
      } else {
        setErrors({ submit: "Failed to create employee. Please try again." });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        variants={backdrop}
        initial="hidden"
        animate="visible"
        exit="hidden"
        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60"
      >
        <motion.div
          variants={modal}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="relative max-w-xl w-full mx-4 p-6 bg-primary text-white shadow-lg rounded-xl border border-gray-700 max-h-[90vh] overflow-y-auto"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white bg-red-500 hover:bg-red-600 rounded-full w-8 h-8 flex items-center justify-center"
            aria-label="Close"
          >
            ✕
          </button>

          <h2 className="text-2xl font-semibold mb-6 text-center">
            Add Employee
          </h2>

          {errors.submit && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded-lg text-red-200">
              {errors.submit}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label htmlFor="name" className="block font-medium mb-1">
                Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter full name"
                className={`w-full px-3 py-2 bg-transparent text-gray-300 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.name ? 'border-red-500' : 'border-gray-700'
                }`}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-400">{errors.name}</p>
              )}
            </div>

            {/* Email & Phone */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label htmlFor="email" className="block font-medium mb-1">
                  Email <span className="text-red-400">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="example@domain.com"
                  className={`w-full px-3 py-2 bg-transparent text-gray-300 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.email ? 'border-red-500' : 'border-gray-700'
                  }`}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-400">{errors.email}</p>
                )}
              </div>
              <div className="flex-1">
                <label htmlFor="phone" className="block font-medium mb-1">
                  Phone <span className="text-red-400">*</span>
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Enter phone number"
                  className={`w-full px-3 py-2 bg-transparent text-gray-300 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.phone ? 'border-red-500' : 'border-gray-700'
                  }`}
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-400">{errors.phone}</p>
                )}
              </div>
            </div>

            {/* Role */}
            <div>
              <label htmlFor="role" className="block font-medium mb-1">
                Role <span className="text-red-400">*</span>
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 bg-primary text-gray-300 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.role ? 'border-red-500' : 'border-gray-700'
                }`}
              >
                <option value="">Select a role</option>
                <option value={COMPANY_ROLES.DEVELOPER}>Developer</option>
                <option value={COMPANY_ROLES.QA}>QA</option>
                <option value={COMPANY_ROLES.ADMIN}>Admin</option>
                <option value={COMPANY_ROLES.OTHERS}>Others</option>
              </select>
              {errors.role && (
                <p className="mt-1 text-sm text-red-400">{errors.role}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block font-medium mb-1">
                Password <span className="text-red-400">*</span>
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter a secure password"
                className={`w-full px-3 py-2 bg-transparent text-gray-300 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.password ? 'border-red-500' : 'border-gray-700'
                }`}
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-400">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block font-medium mb-1"
              >
                Confirm Password <span className="text-red-400">*</span>
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Re-enter your password"
                className={`w-full px-3 py-2 bg-transparent text-gray-300 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.confirmPassword ? 'border-red-500' : 'border-gray-700'
                }`}
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-400">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Submit Button */}
            <div className="text-center pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-6 py-2 rounded-md transition duration-200 ${
                  isSubmitting 
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {isSubmitting ? 'Creating...' : 'Create Employee'}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AddEmployee;