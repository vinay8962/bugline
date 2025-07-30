import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import EmailVerify from "./EmailVerify";
import { toast, ToastContainer } from "react-toastify";

const Register = ({ onClick }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [number, setNumber] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = (e) => {
    e.preventDefault();

    if (!userEmail || !number || !password) {
      toast.error("Please fill in all fields!");
      return;
    }

    if (!/^\d{10}$/.test(number)) {
      toast.error("Please enter a valid 10-digit mobile number.");
      return;
    }

    // Add additional validations here (email format, password strength, etc.)

    toast.success("OTP sent to your email!");
    setShowVerifyModal(true);
  };
  const countries = [
    { code: "+91", short: "IN" },
    { code: "+1", short: "US" },
    { code: "+44", short: "UK" },
    { code: "+61", short: "AU" },
    { code: "+81", short: "JP" },
  ];

  return (
    <div className="bg-[#08080a] border border-gray-800 rounded-xl p-6 space-y-6 relative">
      {/* Toast Container */}
      <ToastContainer />

      <div className="w-full text-center space-y-2">
        <h2 className="text-2xl font-bold text-white">Welcome back</h2>
        <p className="text-gray-500 text-sm">
          Enter your credentials to access your dashboard
        </p>
      </div>

      <form onSubmit={handleRegister} className="space-y-4">
        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-white mb-1">
            Email
          </label>
          <input
            type="email"
            placeholder="Enter your email"
            value={userEmail}
            onChange={(e) => setUserEmail(e.target.value)}
            className="w-full px-3 py-2 bg-transparent text-gray-300 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4F9CF9]"
          />
        </div>

        {/* Mobile Number with +91 */}
        <div>
          <label className="block text-sm font-medium text-white mb-1">
            Number
          </label>
          <div className="flex items-center border border-gray-700 rounded-md overflow-hidden">
            <select className="px-1 py-2 text-sm text-gray-300 bg-gray-900 border-r border-gray-700 outline-none">
              {countries.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code} ({c.short})
                </option>
              ))}
            </select>
            <input
              type="tel"
              placeholder="Enter your number"
              value={number}
              onChange={(e) => {
                const input = e.target.value.replace(/\D/g, "");
                if (input.length <= 10) setNumber(input);
              }}
              className="w-full px-3 py-2 bg-transparent text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#4F9CF9]"
              maxLength={10}
            />
          </div>
        </div>

        {/* Password */}
        <div className="relative">
          <label className="block text-sm font-medium text-white mb-1">
            Password
          </label>
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 bg-transparent text-gray-300 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4F9CF9]"
          />
          <div
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-9 cursor-pointer text-gray-500"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-[#2463eb] text-white py-2 rounded-md hover:bg-blue-500 transition"
        >
          Sign Up
        </button>
      </form>

      {/* Sign In Link */}
      <p className="text-center text-sm text-gray-400">
        Already have an account?{" "}
        <a
          onClick={onClick}
          className="text-[#2057cd] hover:underline cursor-pointer"
        >
          Sign in
        </a>
      </p>

      {/* Modal for Email Verification */}
      {showVerifyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="relative bg-[#08080a] border border-gray-800 rounded-xl p-6 w-[90%] max-w-md z-50">
            <button
              onClick={() => setShowVerifyModal(false)}
              className="absolute top-2 right-2 w-8 h-8 text-white border border-gray-800 p-1 rounded-full"
            >
              ✕
            </button>
            <EmailVerify email={userEmail} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Register;
