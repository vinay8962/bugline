import React, { useState } from "react";
import { Eye, EyeOff, Link } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";
import { setGoogleUser } from "../features/auth/authSlice";
import { useDispatch } from "react-redux";

const Login = ({ onClick }) => {
  const dispatch = useDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const login = useGoogleLogin({
    onSuccess: async (credentialResponse) => {
      try {
        const response = await fetch(
          `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${credentialResponse.access_token}`,
          {
            headers: {
              Authorization: `Bearer ${credentialResponse.access_token}`,
            },
          }
        );

        if (response.ok) {
          const userInfo = await response.json();

          // 🔁 Dispatch to Redux
          dispatch(
            setGoogleUser({
              user: userInfo,
              accessToken: credentialResponse.access_token,
            })
          );

          navigate("/dashboard");
        } else {
          console.error("Failed to fetch user info:", response.statusText);
        }
      } catch (error) {
        console.error("Error fetching user info:", error);
      }
    },
  });

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

      <div className="w-full text-center text-gray-400 border-b border-gray-700 pb-4 mb-4 flex items-center justify-center space-x-2">
        <div className="flex flex-col w-full">
          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-700" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-[#08080a] px-2 text-gray-400">
                Or continue with
              </span>
            </div>
          </div>

          {/* Google Button */}
          <button
            type="button"
            onClick={login}
            className="w-full flex items-center justify-center gap-2 border border-gray-700 rounded-md px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 transition cursor-pointer"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </button>
        </div>
      </div>

      <div className="text-center mt-4 space-y-2">
        <p className="text-sm text-gray-400 hover:text-gray-500/80 font-medium transition-colors block cursor-pointer">
          Forgot your password?
        </p>
        <p className="text-center text-sm text-gray-400">
          Don&apos;t have an account?{" "}
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
