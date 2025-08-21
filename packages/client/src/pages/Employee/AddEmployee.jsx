import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCreateEmployeeMutation } from "../../services/userApi.js";
import { showSuccess, showError } from "../../utils/notifications.jsx";
import EmailVerify from "../../components/EmailVerify.jsx";

// Mock constants since we don't have access to the actual shared module
const COMPANY_ROLES = {
  DEVELOPER: "DEVELOPER",
  QA: "QA",
  ADMIN: "ADMIN",
  OTHERS: "OTHERS",
};

// Country codes data with flags and limits
const countryCodes = [
  {
    code: "+1",
    country: "US",
    flag: "🇺🇸",
    name: "United States",
    maxLength: 10,
  },
  { code: "+1", country: "CA", flag: "🇨🇦", name: "Canada", maxLength: 10 },
  {
    code: "+44",
    country: "GB",
    flag: "🇬🇧",
    name: "United Kingdom",
    maxLength: 10,
  },
  { code: "+91", country: "IN", flag: "🇮🇳", name: "India", maxLength: 10 },
  { code: "+86", country: "CN", flag: "🇨🇳", name: "China", maxLength: 11 },
  { code: "+81", country: "JP", flag: "🇯🇵", name: "Japan", maxLength: 10 },
  { code: "+49", country: "DE", flag: "🇩🇪", name: "Germany", maxLength: 11 },
  { code: "+33", country: "FR", flag: "🇫🇷", name: "France", maxLength: 9 },
  { code: "+39", country: "IT", flag: "🇮🇹", name: "Italy", maxLength: 10 },
  { code: "+34", country: "ES", flag: "🇪🇸", name: "Spain", maxLength: 9 },
  { code: "+7", country: "RU", flag: "🇷🇺", name: "Russia", maxLength: 10 },
  { code: "+55", country: "BR", flag: "🇧🇷", name: "Brazil", maxLength: 11 },
  { code: "+52", country: "MX", flag: "🇲🇽", name: "Mexico", maxLength: 10 },
  { code: "+61", country: "AU", flag: "🇦🇺", name: "Australia", maxLength: 9 },
  {
    code: "+82",
    country: "KR",
    flag: "🇰🇷",
    name: "South Korea",
    maxLength: 10,
  },
  { code: "+65", country: "SG", flag: "🇸🇬", name: "Singapore", maxLength: 8 },
  { code: "+971", country: "AE", flag: "🇦🇪", name: "UAE", maxLength: 9 },
  {
    code: "+966",
    country: "SA",
    flag: "🇸🇦",
    name: "Saudi Arabia",
    maxLength: 9,
  },
  { code: "+60", country: "MY", flag: "🇲🇾", name: "Malaysia", maxLength: 10 },
  { code: "+66", country: "TH", flag: "🇹🇭", name: "Thailand", maxLength: 9 },
];

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

const AddEmployee = ({ onClose, companyId, onEmployeeAdded }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    countryCode: "+91", // Default to India
    role: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [emailVerify, setEmailVerify] = useState(false);

  const [createEmployee, { isLoading: isSubmitting }] =
    useCreateEmployeeMutation();

  // Mock auth status since we don't have access to the actual hook
  const authCompanyId = "mock-company-id";
  const currentCompanyId = companyId || authCompanyId;

  // Get selected country data
  const selectedCountry =
    countryCodes.find(
      (country) =>
        country.code === formData.countryCode && country.country === "IN"
    ) ||
    countryCodes.find((country) => country.code === formData.countryCode) ||
    countryCodes[3];

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Handle phone number with length limit
    if (name === "phone") {
      const maxLength = selectedCountry.maxLength;
      const numericValue = value.replace(/\D/g, ""); // Remove non-numeric characters

      if (numericValue.length <= maxLength) {
        setFormData((prev) => ({
          ...prev,
          [name]: numericValue,
        }));
      }
    } else if (name === "name") {
      // Limit name to 50 characters
      if (value.length <= 50) {
        setFormData((prev) => ({
          ...prev,
          [name]: value,
        }));
      }
    } else if (name === "email") {
      // Limit email to 100 characters
      if (value.length <= 100) {
        setFormData((prev) => ({
          ...prev,
          [name]: value,
        }));
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleCountryCodeChange = (e) => {
    const newCountryCode = e.target.value;
    setFormData((prev) => ({
      ...prev,
      countryCode: newCountryCode,
      phone: "", // Clear phone when country changes
    }));

    // Clear phone error when country changes
    if (errors.phone) {
      setErrors((prev) => ({
        ...prev,
        phone: "",
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
    } else if (formData.name.trim().length > 50) {
      newErrors.name = "Name cannot exceed 50 characters";
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    } else if (formData.email.length > 100) {
      newErrors.email = "Email cannot exceed 100 characters";
    }

    // Phone validation with country-specific length
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else {
      const phoneLength = formData.phone.replace(/\D/g, "").length;
      const minLength = selectedCountry.maxLength - 2; // Allow some flexibility
      const maxLength = selectedCountry.maxLength;

      if (phoneLength < minLength) {
        newErrors.phone = `Phone number must be at least ${minLength} digits for ${selectedCountry.name}`;
      } else if (phoneLength > maxLength) {
        newErrors.phone = `Phone number cannot exceed ${maxLength} digits for ${selectedCountry.name}`;
      }
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
    } else if (formData.password.length > 128) {
      newErrors.password = "Password cannot exceed 128 characters";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password =
        "Password must contain at least one uppercase letter, one lowercase letter, and one number";
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

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    if (!currentCompanyId) {
      setErrors({
        submit: "Company information is missing. Please try again.",
      });
      return;
    }

    try {
      // Create employee data
      const employeeData = {
        companyId: currentCompanyId,
        full_name: formData.name.trim(),
        email: formData.email.trim(),
        phone: `${formData.countryCode}${formData.phone.trim()}`,
        password: formData.password,
        role: formData.role,
      };

      console.log("Creating employee:", employeeData);

      const result = await createEmployee(employeeData).unwrap();

      if (
        result.success ||
        result.data ||
        result.id ||
        result.status === "success"
      ) {
        showSuccess("Employee created successfully!");

        // Show email verification modal after successful employee creation
        setEmailVerify(true);

        if (onEmployeeAdded) {
          onEmployeeAdded();
        }
      } else {
        setErrors({
          submit:
            result.message || "Failed to create employee. Please try again.",
        });
      }
    } catch (error) {
      console.error("Error creating employee:", error);
      const errorMessage =
        error?.data?.message || error?.message || "Failed to create employee";
      showError(errorMessage);
      setErrors({
        submit: errorMessage,
      });
    }
  };

  const handleEmailVerified = () => {
    showSuccess("Email verified successfully!");
    setEmailVerify(true);
    onClose(); // Close the main modal after email verification
  };

  const handleEmailVerifyClose = () => {
    setEmailVerify(false);
    onClose(); // Close the main modal if user cancels email verification
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
          className="relative max-w-xl w-full mx-4 p-4 bg-gray-900 text-white shadow-lg rounded-xl border border-gray-700 max-h-[85vh] overflow-y-auto"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white bg-red-500 hover:bg-red-600 rounded-full w-8 h-8 flex items-center justify-center transition-colors"
            aria-label="Close"
          >
            ✕
          </button>

          <h2 className="text-xl font-semibold mb-4 text-center">
            Add Employee
          </h2>

          {errors.submit && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded-lg text-red-200">
              {errors.submit}
            </div>
          )}

          <div className="space-y-3">
            {/* Name */}
            <div>
              <label htmlFor="name" className="block font-medium mb-1">
                Name <span className="text-red-400">*</span>
                <span className="text-sm text-gray-400 ml-2">
                  ({formData.name.length}/50)
                </span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter full name"
                maxLength={50}
                className={`w-full px-3 py-1.5 bg-transparent text-gray-300 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                  errors.name ? "border-red-500" : "border-gray-700"
                }`}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-400">{errors.name}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block font-medium mb-1">
                Email <span className="text-red-400">*</span>
                <span className="text-sm text-gray-400 ml-2">
                  ({formData.email.length}/100)
                </span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="example@domain.com"
                maxLength={100}
                className={`w-full px-3 py-1.5 bg-transparent text-gray-300 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                  errors.email ? "border-red-500" : "border-gray-700"
                }`}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-400">{errors.email}</p>
              )}
            </div>

            {/* Phone with Country Code */}
            <div>
              <label htmlFor="phone" className="block font-medium mb-1">
                Phone <span className="text-red-400">*</span>
                <span className="text-sm text-gray-400 ml-2">
                  ({formData.phone.length}/{selectedCountry.maxLength})
                </span>
              </label>
              <div className="flex gap-2">
                <select
                  value={formData.countryCode}
                  onChange={handleCountryCodeChange}
                  className="px-3 py-1.5 bg-gray-800 text-gray-300 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-32"
                >
                  {countryCodes.map((country, index) => (
                    <option
                      key={`${country.code}-${country.country}-${index}`}
                      value={country.code}
                    >
                      {country.flag} {country.code} {country.country}
                    </option>
                  ))}
                </select>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder={`Enter ${selectedCountry.maxLength} digit number`}
                  className={`flex-1 px-3 py-1.5 bg-transparent text-gray-300 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                    errors.phone ? "border-red-500" : "border-gray-700"
                  }`}
                />
              </div>
              {errors.phone && (
                <p className="mt-1 text-sm text-red-400">{errors.phone}</p>
              )}
              <p className="mt-1 text-xs text-gray-400">
                Selected: {selectedCountry.flag} {selectedCountry.name} (
                {selectedCountry.code})
              </p>
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
                className={`w-full px-3 py-1.5 bg-gray-800 text-gray-300 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                  errors.role ? "border-red-500" : "border-gray-700"
                }`}
              >
                <option value="">Select a role</option>
                <option value={COMPANY_ROLES.DEVELOPER}>👨‍💻 Developer</option>
                <option value={COMPANY_ROLES.QA}>🧪 QA</option>
                <option value={COMPANY_ROLES.ADMIN}>⚙️ Admin</option>
                <option value={COMPANY_ROLES.OTHERS}>👥 Others</option>
              </select>
              {errors.role && (
                <p className="mt-1 text-sm text-red-400">{errors.role}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block font-medium mb-1">
                Password <span className="text-red-400">*</span>
                <span className="text-sm text-gray-400 ml-2">
                  ({formData.password.length}/128)
                </span>
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter a secure password"
                maxLength={128}
                className={`w-full px-3 py-1.5 bg-transparent text-gray-300 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                  errors.password ? "border-red-500" : "border-gray-700"
                }`}
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-400">{errors.password}</p>
              )}
              <p className="mt-1 text-xs text-gray-400">
                Must contain: uppercase, lowercase, number (8-128 chars)
              </p>
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
                className={`w-full px-3 py-1.5 bg-transparent text-gray-300 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                  errors.confirmPassword ? "border-red-500" : "border-gray-700"
                }`}
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-400">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <div className="text-center pt-2">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleSubmit}
                className={`px-6 py-2 rounded-md transition-all duration-200 font-medium ${
                  isSubmitting
                    ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700 transform hover:scale-105"
                }`}
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Creating...
                  </span>
                ) : (
                  "Create Employee"
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Email Verify Modal */}
      {emailVerify && (
        <motion.div
          variants={backdrop}
          initial="hidden"
          animate="visible"
          exit="hidden"
          className="fixed inset-0 z-60 flex items-center justify-center bg-black bg-opacity-70"
        >
          <motion.div
            variants={modal}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="relative max-w-md w-full mx-4 p-6 bg-gray-900 text-white shadow-lg rounded-xl border border-gray-700"
          >
            {/* Close Button for Email Verify Modal */}
            <button
              onClick={handleEmailVerifyClose}
              className="absolute top-4 right-4 text-white bg-red-500 hover:bg-red-600 rounded-full w-8 h-8 flex items-center justify-center transition-colors"
              aria-label="Close"
            >
              ✕
            </button>

            <EmailVerify
              email={formData.email}
              onClose={handleEmailVerifyClose}
              onVerified={handleEmailVerified}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AddEmployee;
