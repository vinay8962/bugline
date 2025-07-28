import React from "react";
import { Bug } from "lucide-react"; // Or replace with your own icon component
import { NavLink } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="border-b border-white/10 backdrop-blur-sm bg-black/80 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <Bug className="h-8 w-8 text-second-primary" />
            <span className="text-2xl font-bold bg-second-primary bg-clip-text text-transparent">
              BugLine
            </span>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <a
              href="#features"
              className="text-gray-400 hover:text-white transition-colors duration-300"
            >
              Features
            </a>
            <a
              href="/dashboard"
              className="text-gray-400 hover:text-white transition-colors duration-300"
            >
              Dashboard
            </a>
            <a
              href="#pricing"
              className="text-gray-400 hover:text-white transition-colors duration-300"
            >
              Pricing
            </a>
          </div>

          {/* Buttons */}
          <div className="flex items-center space-x-4">
            <button className="text-gray-300 hover:text-white transition px-4 py-2 rounded-md">
              <NavLink to="/auth">Sign In</NavLink>
            </button>
            <button className="bg-second-primary text-white px-4 py-2 rounded-md font-semibold shadow-md hover:scale-105 transition-transform duration-200">
              Get Started
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
