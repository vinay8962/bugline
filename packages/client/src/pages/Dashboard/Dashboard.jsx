import React, { useEffect, useRef, useState } from "react";
import {
  Bug,
  Bell,
  Plus,
  Search,
  LogOut,
  Settings,
  UserPlus} from "lucide-react";
import BugStats from "../../components/BugStats";
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
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const menuRef = useRef();
  const dispatch = useDispatch();
  
  // Get auth status and company information
  const { companyId, companyRole, hasCompanyAccess, isSuperAdmin } = useAuthStatus();
  console.log(companyId, companyRole, hasCompanyAccess, isSuperAdmin);

  // Hook usage here
  useClickOutside(menuRef, () => setOpen(false));

  const logout = () => {
    try {
      // Google logout
      googleLogout();

      // Redux logout
      dispatch(logoutUser());

      // Navigate to login or home page
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
    return <p className="text-center text-white">Loading stats...</p>;
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "Critical":
        return "bg-red-600 text-white";
      case "High":
        return "bg-orange-500 text-white";
      case "Medium":
        return "bg-yellow-400 text-black";
      case "Low":
        return "bg-gray-300 text-black";
      default:
        return "bg-gray-200 text-black";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Open":
        return "bg-orange-200 text-orange-800";
      case "In Progress":
        return "bg-blue-200 text-blue-800";
      case "Fixed":
        return "bg-green-200 text-green-800";
      case "Closed":
        return "bg-gray-200 text-gray-800";
      default:
        return "bg-gray-200 text-gray-800";
    }
  };

  return (
    <div className="bg-primary min-h-screen relative pb-10">
      {/* Header */}
      <header className="border-b border-gray-700/30 bg-primary/5 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo and Title */}
            <div className="flex items-center space-x-4">
              <div className="bg-second-primary p-2 rounded-lg shadow-md">
                <Bug className="h-6 w-6 text-white" />
              </div>
              <div className="hidden md:block">
                <h1 className="text-2xl font-bold bg-second-primary bg-clip-text text-transparent">
                  BugLine Dashboard
                </h1>
                <p className="text-sm text-gray-400">
                  Manage and track bug reports
                </p>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex items-center space-x-2">
              <button className="w-10 h-10 border border-gray-600/40 rounded-xl flex items-center justify-center hover:bg-gray-700 transition">
                <Bell className="h-4 w-4 text-white" />
              </button>
              <div className="relative inline-block text-left" ref={menuRef}>
                <button
                  onClick={() => setOpen(!open)}
                  aria-expanded={open}
                  aria-haspopup="true"
                  aria-label="User settings menu"
                  className="p-3 rounded-xl border border-gray-600/40 bg-background/50 backdrop-blur hover:bg-gray-700 "
                >
                  <Settings className="h-4 w-4 text-white" />
                </button>
                {open && (
                  <div className="fixed top-16 right-4 w-56 bg-gray-800 border border-gray-600 rounded-lg shadow-2xl z-[9999] overflow-hidden">
                    <div className="py-2">
                      <button
                        onClick={() => {
                          setShowModal(true);
                          setOpen(false);
                        }}
                        className="flex w-full items-center px-4 py-3 text-sm text-white hover:bg-gray-700 transition-colors"
                      >
                        <UserPlus className="h-4 w-4 mr-3" /> Add Employee
                      </button>
                      <Link
                        to="/profile"
                        onClick={() => setOpen(false)}
                        className="flex items-center px-4 py-3 text-sm text-white hover:bg-gray-700 transition-colors"
                      >
                        <Settings className="h-4 w-4 mr-3" /> Profile
                      </Link>
                      <div className="border-t border-gray-700 my-1"></div>
                      <button
                        onClick={() => {
                          logout();
                          setOpen(false);
                        }}
                        className="w-full flex items-center px-4 py-3 text-sm text-red-400 hover:bg-gray-700 hover:text-red-300 transition-colors"
                      >
                        <LogOut className="h-4 w-4 mr-3" /> Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Dashboard Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {isSuperAdmin ? (
          <SuperAdminDashboard />
        ) : hasCompanyAccess && companyId ? (
          <CompanyDashboard companyId={companyId} companyRole={companyRole} />
        ) : (
          <>
            <BugStats stats={stats} />
          </>
        )}
      </div>

      {/* Bug List Section - Only show if not in super admin or company dashboard mode */}
      {!isSuperAdmin && (!hasCompanyAccess || !companyId) && (
      <div className="backdrop-blur-sm bg-primary border border-gray-800 rounded-lg mb-0 p-6 max-w-7xl mx-auto">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-white">Bug Reports</h2>
          <p className="text-sm text-gray-400">
            View and manage all bug reports
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative w-full sm:flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search bugs..."
              className="pl-10 pr-4 py-2 w-full text-white border border-gray-800 rounded-md bg-transparent text-sm"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-800 rounded-md px-3 py-2 text-sm bg-primary text-white w-[140px]"
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
            className="border border-gray-800 rounded-md px-3 py-2 text-sm bg-primary text-white w-[140px]"
          >
            <option value="all">All Priority</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>
      )}

      {/* Modal for Add Employee */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center">
          <div className="relative w-full max-w-2xl mx-auto">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-2 right-2 text-white bg-red-500 rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600"
            >
              ✕
            </button>
            <AddEmployee onClose={() => setShowModal(false)} companyId={companyId} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
