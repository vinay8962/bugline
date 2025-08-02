import React, { useState } from "react";
import { Eye, EyeOff, Link } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";

const Login = ({ onClick }) => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleGoogleSuccess = async (credentialResponse) => {
    console.log("Google Login Success:", credentialResponse);
    console.log("🔑 ID Token for Postman:", credentialResponse.credential);
    console.log("📋 Copy this token to test in Postman");
    console.log("📝 Postman Request Body:");
    console.log(
      JSON.stringify(
        {
          idToken: credentialResponse.credential,
        },
        null,
        2
      )
    );

    // Store the ID token locally for testing
    localStorage.setItem("google_id_token", credentialResponse.credential);

    try {
      // Call your backend API
      const response = await fetch('http://localhost:5001/api/v1/auth/google-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          idToken: credentialResponse.credential
        })
      });

      const data = await response.json();
      
      if (data.success) {
        console.log('✅ Backend login successful:', data);
        
        // Handle based on user role and redirectTo
        const { user, redirectTo } = data.data;
        
        if (redirectTo === 'admin') {
          // Store encrypted token for Company Admin
          localStorage.setItem('adminToken', data.data.encryptedToken);
          localStorage.setItem('adminIV', data.data.iv);
          localStorage.setItem('userRole', 'COMPANY_ADMIN');
          navigate('/admin-dashboard');
        } else if (redirectTo === 'developer-dashboard') {
          // Store JWT token for Developer
          localStorage.setItem('authToken', data.data.token);
          localStorage.setItem('userRole', 'DEVELOPER');
          navigate('/developer-dashboard');
        } else if (redirectTo === 'qa-dashboard') {
          // Store JWT token for QA
          localStorage.setItem('authToken', data.data.token);
          localStorage.setItem('userRole', 'QA');
          navigate('/qa-dashboard');
        } else {
          // Default dashboard
          localStorage.setItem('authToken', data.data.token);
          navigate('/dashboard');
        }
        
        // Store user info
        localStorage.setItem('user', JSON.stringify(user));
        
      } else {
        console.error('❌ Backend login failed:', data.message);
        alert('Login failed: ' + data.message);
      }
      
    } catch (error) {
      console.error('❌ Network error:', error);
      alert('Network error: ' + error.message);
    }
  };

  const handleGoogleError = () => {
    console.log("Google Login Failed");
  };

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
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            useOneTap
          />
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
