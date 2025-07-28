import React, { useState } from "react";
import { Eye, EyeOff, Link } from "lucide-react";
import { NavLink } from "react-router-dom";

const Login = ({ onClick }) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="bg-[#08080a] border-[00.01px] border-gray-800 rounded-xl p-6 space-y-6">
      <div className="w-full text-center space-y-2">
        <h2 className="text-2xl font-bold text-white">Welcome back</h2>
        <p className="text-gray-500 text-sm">
          Enter your credentials to access your dashboard
        </p>
      </div>

      <form className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-white mb-1">
            Email
          </label>
          <input
            type="email"
            placeholder="Enter your email"
            className="w-full px-3 py-2 bg-transparent   text-gray-300 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4F9CF9]"
          />
        </div>

        <div className="relative">
          <label className="block text-sm font-medium text-white mb-1">
            Password
          </label>
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            className="w-full px-3 py-2 bg-transparent text-gray-300 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4F9CF9]"
          />
          <div
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-9 cursor-pointer text-gray-500"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-[#2463eb] text-white py-2 rounded-md hover:bg-blue-500 transition"
        >
          Sign In
        </button>
      </form>
      <div className="text-center mt-4 space-y-2">
        <p className="text-sm text-gray-400 hover:text-gray-500/80 font-medium transition-colors block cursor-pointer">
          Forgot your password?
        </p>
        <p className="text-center text-sm text-gray-400">
          Don't have an account?{" "}
          <a
            onClick={onClick}
            className="text-[#2057cd] hover:underline cursor-pointer"
          >
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;
