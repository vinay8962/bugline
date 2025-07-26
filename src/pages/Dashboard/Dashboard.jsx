import React, { useEffect, useState } from "react";
import { Bug, Bell, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import BugStats from "../../components/BugStats";
const Dashboard = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setStats({
        total: 128,
        open: 42,
        inProgress: 31,
        fixed: 55,
      });
    }, 1000); // 1 second delay
  }, []);

  if (!stats) {
    return <p className="text-center text-white">Loading stats...</p>;
  }
  return (
    <div className="bg-primary min-h-screen">
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

            {/* Right side buttons */}
            <div className="flex items-center space-x-2">
              <button className="w-10 h-10 border border-gray-600/40 rounded-xl flex items-center justify-center hover:bg-gray-700 transition">
                <Bell className="h-4 w-4 text-white" />
              </button>
              <Link to="/report-bug">
                <button className="flex items-center px-4 py-3 w-36 gap-2 bg-second-primary text-white text-sm font-medium rounded-xl hover:bg-second-primary/50 cursor-pointer transition">
                  <Plus className="h-4 w-4 mr-2" />
                  Report Bug
                </button>
              </Link>
            </div>
          </div>
        </div>
      </header>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Cards Grid */}
        <BugStats stats={stats} />
      </div>
    </div>
  );
};

export default Dashboard;
