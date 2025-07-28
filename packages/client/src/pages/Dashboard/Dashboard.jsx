import React, { useEffect, useState } from "react";
import { Bug, Bell, Plus, Search, MessageSquare, LogOut } from "lucide-react";
import BugStats from "../../components/BugStats";
import AddEmployee from "../Employee/AddEmployee";
import { googleLogout } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const navigate = useNavigate();

  const logout = () => {
    try {
      // Google logout
      googleLogout();

      // Clear all stored user data
      localStorage.removeItem("user");
      localStorage.removeItem("access_token");

      navigate("/");

      console.log("Logout successful");

      return true;
    } catch (error) {
      console.error("Logout error:", error);
      return false;
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

  const mockBugs = [
    {
      id: "1",
      title: "Login button not responding on mobile",
      description: "The login button doesn't work when tapped on iOS devices",
      priority: "High",
      status: "Open",
      reporter: "John Doe",
      assignee: "Jane Smith",
      createdAt: "2024-01-15T10:30:00Z",
      unreadMessages: 3,
    },
    {
      id: "2",
      title: "Dashboard loading slowly",
      description: "The main dashboard takes more than 10 seconds to load",
      priority: "Medium",
      status: "In Progress",
      reporter: "Alice Johnson",
      assignee: "Bob Wilson",
      createdAt: "2024-01-14T14:20:00Z",
      unreadMessages: 0,
    },
    {
      id: "3",
      title: "Error message not showing",
      description: "When form validation fails, no error message appears",
      priority: "Critical",
      status: "Fixed",
      reporter: "Mike Brown",
      assignee: "Sarah Davis",
      createdAt: "2024-01-13T09:15:00Z",
      unreadMessages: 1,
    },
  ];

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

  const filteredBugs = mockBugs.filter((bug) => {
    const matchesStatus =
      statusFilter === "all" || bug.status.toLowerCase() === statusFilter;
    const matchesPriority =
      priorityFilter === "all" || bug.priority.toLowerCase() === priorityFilter;
    return matchesStatus && matchesPriority;
  });

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
              <button
                onClick={() => setShowModal(true)}
                className="flex items-center px-4 py-3 w-40 gap-2 bg-second-primary text-white text-sm font-medium rounded-xl hover:bg-second-primary/50 transition"
              >
                <Plus className="h-4 w-4" />
                Add Employee
              </button>
              <button
                onClick={logout}
                className="flex items-center justify-center border border-gray-800 px-4 py-3 w-32 gap-2 bg-primary text-white text-sm font-medium rounded-xl hover:bg-gray-800/50 cursor-pointer transition"
              >
                <LogOut className="h-4 w-4" /> Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <BugStats stats={stats} />
      </div>

      {/* Bug List Section */}
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

        {/* Bug List */}
        <div className="space-y-4">
          {filteredBugs.map((bug) => (
            <div
              key={bug.id}
              className="border border-gray-700 rounded-lg p-4 bg-primary text-white   hover:shadow transition-shadow cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <h3 className="font-semibold text-sm">{bug.title}</h3>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(
                        bug.priority
                      )}`}
                    >
                      {bug.priority}
                    </span>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${getStatusColor(
                        bug.status
                      )}`}
                    >
                      {bug.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mb-2 line-clamp-2">
                    {bug.description}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-gray-400">
                    <span>Reported by {bug.reporter}</span>
                    <span>Assigned to {bug.assignee}</span>
                    <span>{new Date(bug.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <button className="border border-gray-800 rounded px-3 py-1 text-sm hover:bg-gray-800">
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

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
            <AddEmployee onClose={() => setShowModal(false)} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
