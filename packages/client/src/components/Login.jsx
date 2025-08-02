import React, { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "../hooks/useAuth";

const Login = ({ onClick }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { handleGoogleLogin, handleLogin } = useAuth();

  const handleGoogleSuccess = async (credentialResponse) => {
    setIsLoading(true);
    setError('');
    
    // Development logging only
    if (import.meta.env.VITE_APP_ENV === 'development') {
      }

    const result = await handleGoogleLogin(credentialResponse.credential);
    
    if (!result.success) {
      setError(result.error);
      if (import.meta.env.VITE_APP_ENV === 'development') {
        }
    }
    
    setIsLoading(false);
  };

  const handleGoogleError = () => {
    setError('Google login failed. Please try again.');
    if (import.meta.env.VITE_APP_ENV === 'development') {
      }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle regular login form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      setIsLoading(false);
      return;
    }

    const result = await handleLogin(formData);
    
    if (!result.success) {
      setError(result.error);
    }
    
    setIsLoading(false);
  };

  return (
    <div className="bg-[#08080a] border-[00.01px] border-gray-800 rounded-xl p-6 space-y-6">
      <div className="w-full text-center space-y-2">
        <h2 className="text-2xl font-bold text-white">Welcome back</h2>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-md p-3">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      <div className="w-full text-center text-gray-400 border-b border-gray-700 pb-4 mb-4 flex items-center justify-center space-x-2">
        <div className="flex flex-col w-full">
          {/* Google Button */}
          {isLoading ? (
            <div className="w-full bg-gray-700 text-gray-400 py-3 px-4 rounded-lg text-center flex items-center justify-center space-x-2">
              <div className="loading-spinner rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
              <span>Signing in with Google...</span>
            </div>
          ) : (
            <div className="google-login-container">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                useOneTap
                theme="filled_black"
                size="large"
                text="signin_with"
                shape="rectangular"
                width="100%"
                locale="en"
                type="standard"
                context="signin"
                ux_mode="popup"
                auto_select="false"
                cancel_on_tap_outside="true"
                className="google-login-button"
              />
            </div>
          )}
        </div>
      </div>

      <div className="text-center mt-4 space-y-2">
        <p className="text-sm text-gray-400 hover:text-gray-300 font-medium transition-colors block cursor-pointer">
          Forgot your password?
        </p>
        <p className="text-center text-sm text-gray-400">
          Don&apos;t have an account?{" "}
          <a
            onClick={onClick}
            className="text-[#2057cd] hover:text-[#1e40af] hover:underline cursor-pointer transition-colors"
          >
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;
