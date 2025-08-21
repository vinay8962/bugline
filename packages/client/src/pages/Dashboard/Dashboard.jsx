import React, { useEffect, useRef, useState } from "react";
import {
  Bug,
  Bell,
  Plus,
  Search,
  LogOut,
  Settings,
  UserPlus,
  Home,
  BarChart3,
  Shield,
  Building2,
} from "lucide-react";
import BugsStats from "../../components/BugsStats";
import AddEmployee from "../Employee/AddEmployee";
import CompanyDashboard from "../../components/CompanyDashboard";
import SuperAdminDashboard from "../../components/SuperAdminDashboard";
import { googleLogout } from "@react-oauth/google";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logoutUser } from "../../features/auth/authSlice";
import { useAuthStatus } from "../../hooks/useAuth";
import useClickOutside from "../../hooks/useClickOutside";
import companyApi from "../../services/companyApi";

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [notificationCount, setNotificationCount] = useState(3);
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const menuRef = useRef();
  const dispatch = useDispatch();

  // Get auth status and company information (now reactive to storage changes)
  const {
    companyId,
    companyRole,
    hasCompanyAccess,
    isSuperAdmin,
    _refreshKey,
  } = useAuthStatus();

  // Clean up any company creation flags on mount
  useEffect(() => {
    if (localStorage.getItem("company_created")) {
      localStorage.removeItem("company_created");
    }
  }, []);

  // Hook usage here
  useClickOutside(menuRef, () => setOpen(false));

  const logout = () => {
    try {
      googleLogout();
      dispatch(logoutUser());
      navigate("/");
    } catch (error) {
      // Handle logout error
    }
  };

  useEffect(() => {
    setTimeout(() => {
      setStats({
        total: 128,
        open: 42,
        inProgress: 31,
        fixed: 55,
      });
    }, 1000);
  }, []);

  if (!stats) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-300 text-lg">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "Critical":
        return "bg-red-600 text-white";
      case "High":
        return "bg-orange-500 text-white";
      case "Medium":
        return "bg-yellow-500 text-black";
      case "Low":
        return "bg-emerald-500 text-white";
      default:
        return "bg-slate-500 text-white";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Open":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "In Progress":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Fixed":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "Closed":
        return "bg-slate-100 text-slate-800 border-slate-200";
      default:
        return "bg-slate-100 text-slate-800 border-slate-200";
    }
  };

  return (
    <div className="min-h-screen bg-primary text-white">
      {/* Enhanced Header */}
      <header className="bg-slate-800/50 border-b border-slate-700/50 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo and Title */}
            <div className="flex items-center space-x-4">
              <div className="bg-blue-600 p-3 rounded-xl shadow-lg">
                <Bug className="h-6 w-6 text-white" />
              </div>
              <div className="hidden md:block">
                <h1 className="text-2xl font-bold text-white">
                  BugLine Dashboard
                </h1>
                <p className="text-sm text-slate-400">
                  Manage and track bug reports efficiently
                </p>
              </div>
            </div>

            {/* Navigation and Actions */}
            <div className="flex items-center space-x-3">
              {/* Quick Actions */}
              <div className="hidden md:flex items-center space-x-2">
                <button className="p-2 rounded-lg bg-slate-700/50 hover:bg-slate-600/50 transition-colors duration-200 border border-slate-600/50">
                  <Home className="h-4 w-4 text-slate-300" />
                </button>
                <button className="p-2 rounded-lg bg-slate-700/50 hover:bg-slate-600/50 transition-colors duration-200 border border-slate-600/50">
                  <BarChart3 className="h-4 w-4 text-slate-300" />
                </button>
              </div>

              {/* Notifications */}
              <button className="relative p-2 rounded-lg bg-slate-700/50 hover:bg-slate-600/50 transition-colors duration-200 border border-slate-600/50">
                <Bell className="h-4 w-4 text-slate-300" />
                {notificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                    {notificationCount}
                  </span>
                )}
              </button>

              {/* User Menu */}
              <div className="relative inline-block text-left" ref={menuRef}>
                <button
                  onClick={() => setOpen(!open)}
                  className="flex items-center space-x-2 p-2 rounded-lg bg-slate-700/50 hover:bg-slate-600/50 transition-colors duration-200 border border-slate-600/50"
                >
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <Shield className="h-4 w-4 text-white" />
                  </div>
                  <Settings className="h-4 w-4 text-slate-300" />
                </button>

                {open && (
                  <div className="absolute right-0 mt-2 w-64 bg-primary border border-slate-600 rounded-xl shadow-2xl z-50 overflow-hidden">
                    <div className="p-4 border-b border-slate-700">
                      <p className="text-sm text-slate-400">Signed in as</p>
                      <p className="text-white font-medium truncate">
                        {companyRole || "User"}
                      </p>
                    </div>

                    <div className="py-2">
                      <button
                        onClick={() => {
                          setShowModal(true);
                          setOpen(false);
                        }}
                        className="flex w-full items-center px-4 py-3 text-sm text-white hover:bg-slate-700 transition-colors duration-200"
                      >
                        <UserPlus className="h-4 w-4 mr-3 text-blue-400" />
                        Add Employee
                      </button>

                      <Link
                        to="/profile"
                        onClick={() => setOpen(false)}
                        className="flex items-center px-4 py-3 text-sm text-white hover:bg-slate-700 transition-colors duration-200"
                      >
                        <Settings className="h-4 w-4 mr-3 text-slate-400" />
                        Profile Settings
                      </Link>

                      <div className="border-t border-slate-700 my-2"></div>

                      <button
                        onClick={() => {
                          logout();
                          setOpen(false);
                        }}
                        className="w-full flex items-center px-4 py-3 text-sm text-red-400 hover:bg-slate-700 hover:text-red-300 transition-colors duration-200"
                      >
                        <LogOut className="h-4 w-4 mr-3" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Dashboard Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Dashboard Type Selection */}
        {isSuperAdmin ? (
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-purple-600 rounded-lg">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white">
                Super Admin Dashboard
              </h2>
            </div>
            <SuperAdminDashboard />
          </div>
        ) : hasCompanyAccess && companyId ? (
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Building2 className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white">
                Company Dashboard
              </h2>
              <span className="px-3 py-1 bg-slate-700 text-slate-300 text-sm rounded-full border border-slate-600">
                {companyRole}
              </span>
            </div>
            <CompanyDashboard
              key={`${companyId}-${_refreshKey}`}
              companyId={companyId}
              companyRole={companyRole}
            />
          </div>
        ) : (
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-emerald-600 rounded-lg">
                <BarChart3 className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white">
                Overview Dashboard
              </h2>
            </div>
            <BugsStats stats={stats} />
          </div>
        )}

        {/* Enhanced Bug List Section */}
        {!isSuperAdmin && (!hasCompanyAccess || !companyId) && (
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-8 backdrop-blur-sm">
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    Bug Reports
                  </h2>
                  <p className="text-slate-400">
                    View and manage all bug reports in your system
                  </p>
                </div>
                <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 flex items-center space-x-2">
                  <Plus className="h-4 w-4" />
                  <span>New Bug</span>
                </button>
              </div>
            </div>

            {/* Enhanced Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search bugs..."
                  className="w-full pl-10 pr-4 py-3 text-white border border-slate-600 rounded-lg bg-slate-700/50 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-3 border border-slate-600 rounded-lg text-sm bg-slate-700/50 text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
              >
                <option value="all">All Status</option>
                <option value="open">Open</option>
                <option value="in progress">In Progress</option>
                <option value="fixed">Fixed</option>
                <option value="closed">Closed</option>
              </select>

              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="px-4 py-3 border border-slate-600 rounded-lg text-sm bg-slate-700/50 text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
              >
                <option value="all">All Priority</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>

              <button className="px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors duration-200 border border-slate-600">
                Apply Filters
              </button>
            </div>

            {/* Placeholder for bug list */}
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bug className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">
                No bugs found
              </h3>
              <p className="text-slate-400 mb-4">
                Create your first bug report to get started
              </p>
              <button className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200">
                Create Bug Report
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Enhanced Modal for Add Employee */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-2xl mx-auto">
            <button
              onClick={() => setShowModal(false)}
              className="absolute -top-12 right-0 text-white bg-slate-700 hover:bg-slate-600 rounded-full w-10 h-10 flex items-center justify-center transition-colors duration-200 border border-slate-600"
            >
              ✕
            </button>
            <AddEmployee
              onClose={() => setShowModal(false)}
              companyId={companyId}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
