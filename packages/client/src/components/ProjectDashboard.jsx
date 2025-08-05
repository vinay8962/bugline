import React, { useState } from "react";
import {
  FolderPlus,
  Bug,
  Plus,
  Search,
  ArrowLeft,
  Calendar,
  User,
  AlertTriangle,
  Clock,
  CheckCircle,
  Eye
} from "lucide-react";
import { useGetProjectDetailsQuery } from "../services/projectApi.js";
import { useGetBugsByProjectQuery } from "../services/bugApi.js";
import LoadingSpinner from "./LoadingSpinner.jsx";

const ProjectDashboard = ({ projectId, onBack }) => {
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const {
    data: projectDetails,
    isLoading: loadingProject,
    error: projectError,
  } = useGetProjectDetailsQuery(projectId, {
    skip: !projectId,
  });

  const {
    data: bugsData,
    isLoading: loadingBugs,
    error: bugsError,
  } = useGetBugsByProjectQuery(projectId, {
    skip: !projectId,
  });

  // Handle loading state
  if (loadingProject || loadingBugs) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  // Handle error state
  if (projectError || bugsError) {
    return (
      <div className="text-center py-12">
        <p className="text-red-400">Failed to load project details</p>
        <button
          onClick={onBack}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Go Back
        </button>
      </div>
    );
  }

  const project = projectDetails?.data;
  const bugs = bugsData?.data || [];

  // Filter bugs
  const filteredBugs = bugs.filter((bug) => {
    const matchesStatus =
      statusFilter === "all" || bug.status.toLowerCase() === statusFilter;
    const matchesPriority =
      priorityFilter === "all" || bug.priority.toLowerCase() === priorityFilter;
    const matchesSearch =
      searchTerm === "" ||
      bug.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bug.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesPriority && matchesSearch;
  });

  // Calculate stats
  const stats = {
    total: bugs.length,
    open: bugs.filter(b => b.status === 'open').length,
    in_progress: bugs.filter(b => b.status === 'in_progress').length,
    resolved: bugs.filter(b => b.status === 'resolved').length,
    closed: bugs.filter(b => b.status === 'closed').length,
    critical: bugs.filter(b => b.priority === 'critical').length,
    high: bugs.filter(b => b.priority === 'high').length,
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "critical":
        return "bg-red-600 text-white";
      case "high":
        return "bg-orange-500 text-white";
      case "medium":
        return "bg-yellow-400 text-black";
      case "low":
        return "bg-gray-300 text-black";
      default:
        return "bg-gray-200 text-black";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "open":
        return "bg-orange-200 text-orange-800";
      case "in_progress":
        return "bg-blue-200 text-blue-800";
      case "resolved":
        return "bg-green-200 text-green-800";
      case "closed":
        return "bg-gray-200 text-gray-800";
      default:
        return "bg-gray-200 text-gray-800";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "open":
        return <AlertTriangle className="w-4 h-4" />;
      case "in_progress":
        return <Clock className="w-4 h-4" />;
      case "resolved":
        return <CheckCircle className="w-4 h-4" />;
      case "closed":
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <Bug className="w-4 h-4" />;
    }
  };

  return (
    <div className="bg-primary min-h-screen relative pb-10">
      {/* Header */}
      <header className="border-b border-gray-700/30 bg-primary/5 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Back Button and Project Info */}
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="p-2 border border-gray-600/40 rounded-xl flex items-center justify-center hover:bg-gray-700 transition"
              >
                <ArrowLeft className="h-4 w-4 text-white" />
              </button>
              <div className="flex items-center gap-4">
                <div className="bg-blue-600 p-2 rounded-lg shadow-md">
                  <FolderPlus className="h-6 w-6 text-white" />
                </div>
                <div className="hidden md:block">
                  <h1 className="text-2xl font-bold bg-blue-600 bg-clip-text text-transparent">
                    {project?.name}
                  </h1>
                  <p className="text-sm text-gray-400">
                    Project Dashboard • {project?.company?.name}
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2">
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
                <Plus className="h-4 w-4" />
                New Bug
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Project Stats */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-primary border border-gray-800 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <Bug className="w-5 h-5 text-blue-500" />
              <span className="text-gray-400 text-sm">Total Bugs</span>
            </div>
            <p className="text-2xl font-bold text-white mt-1">{stats.total}</p>
          </div>
          <div className="bg-primary border border-gray-800 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              <span className="text-gray-400 text-sm">Open</span>
            </div>
            <p className="text-2xl font-bold text-white mt-1">{stats.open}</p>
          </div>
          <div className="bg-primary border border-gray-800 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-500" />
              <span className="text-gray-400 text-sm">In Progress</span>
            </div>
            <p className="text-2xl font-bold text-white mt-1">{stats.in_progress}</p>
          </div>
          <div className="bg-primary border border-gray-800 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-gray-400 text-sm">Resolved</span>
            </div>
            <p className="text-2xl font-bold text-white mt-1">{stats.resolved}</p>
          </div>
          <div className="bg-primary border border-gray-800 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <span className="text-gray-400 text-sm">Critical</span>
            </div>
            <p className="text-2xl font-bold text-white mt-1">{stats.critical}</p>
          </div>
        </div>

        {/* Bug List Section */}
        <div className="backdrop-blur-sm bg-primary border border-gray-800 rounded-lg mb-0 p-6">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-white">Bug Reports</h2>
            <p className="text-sm text-gray-400">
              View and manage all bugs in this project
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative w-full sm:flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search bugs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
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
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
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
            {filteredBugs.length === 0 ? (
              <div className="text-center py-12">
                <div className="p-4 bg-gray-800 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Bug className="w-8 h-8 text-gray-400" />
                </div>
                <h4 className="text-lg font-semibold text-white mb-2">
                  {bugs.length === 0 ? "No Bugs Yet" : "No Matching Bugs"}
                </h4>
                <p className="text-gray-400 mb-6 max-w-md mx-auto">
                  {bugs.length === 0 
                    ? "This project doesn't have any bug reports yet. Get started by reporting your first bug."
                    : "No bugs match your current filters. Try adjusting your search criteria."
                  }
                </p>
                {bugs.length === 0 && (
                  <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto">
                    <Plus className="w-5 h-5" />
                    Report First Bug
                  </button>
                )}
              </div>
            ) : (
              filteredBugs.map((bug) => (
                <div
                  key={bug.id}
                  className="border border-gray-700 rounded-lg p-4 bg-primary text-white hover:shadow hover:border-gray-600 transition-all cursor-pointer"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <div className="flex items-center gap-1">
                          {getStatusIcon(bug.status)}
                          <h3 className="font-semibold text-sm">{bug.title}</h3>
                        </div>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(
                            bug.priority
                          )}`}
                        >
                          {bug.priority.charAt(0).toUpperCase() + bug.priority.slice(1)}
                        </span>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${getStatusColor(
                            bug.status
                          )}`}
                        >
                          {bug.status.replace('_', ' ').charAt(0).toUpperCase() + bug.status.replace('_', ' ').slice(1)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-400 mb-2 line-clamp-2">
                        {bug.description}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          <span>Reported by {bug.reporter?.full_name || bug.reporter?.email || 'Unknown'}</span>
                        </div>
                        {bug.assignee && (
                          <div className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            <span>Assigned to {bug.assignee?.full_name || bug.assignee?.email}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>{new Date(bug.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <button className="border border-gray-800 rounded px-3 py-1 text-sm hover:bg-gray-800 flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        View
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDashboard;