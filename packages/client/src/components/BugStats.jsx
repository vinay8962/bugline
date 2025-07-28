import React from "react";
import { Bug, AlertTriangle, Clock, CheckCircle } from "lucide-react";

const BugStats = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      {/* Total Bugs */}
      <div className="bg-primary border border-gray-700/30 rounded-xl backdrop-blur-sm p-4 shadow-md">
        <div className="flex items-center justify-between pb-2">
          <h3 className="text-sm font-medium text-white">Total Bugs</h3>
          <Bug className="h-4 w-4 text-gray-400" />
        </div>
        <div className="text-2xl font-bold text-white">{stats.total}</div>
        <p className="text-xs text-gray-400 mt-1">+2 from last week</p>
      </div>

      {/* Open Bugs */}
      <div className="bg-primary border border-gray-700/30 rounded-xl backdrop-blur-sm p-4 shadow-md">
        <div className="flex items-center justify-between pb-2">
          <h3 className="text-sm font-medium text-white">Open</h3>
          <AlertTriangle className="h-4 w-4 text-yellow-400" />
        </div>
        <div className="text-2xl font-bold text-white">{stats.open}</div>
        <p className="text-xs text-gray-400 mt-1">Needs attention</p>
      </div>

      {/* In Progress */}
      <div className="bg-primary border border-gray-700/30 rounded-xl backdrop-blur-sm p-4 shadow-md">
        <div className="flex items-center justify-between pb-2">
          <h3 className="text-sm font-medium text-white">In Progress</h3>
          <Clock className="h-4 w-4 text-blue-400" />
        </div>
        <div className="text-2xl font-bold text-white">{stats.inProgress}</div>
        <p className="text-xs text-gray-400 mt-1">Being worked on</p>
      </div>

      {/* Fixed Bugs */}
      <div className="bg-primary border border-gray-700/30 rounded-xl backdrop-blur-sm p-4 shadow-md">
        <div className="flex items-center justify-between pb-2">
          <h3 className="text-sm font-medium text-white">Fixed</h3>
          <CheckCircle className="h-4 w-4 text-green-400" />
        </div>
        <div className="text-2xl font-bold text-white">{stats.fixed}</div>
        <p className="text-xs text-gray-400 mt-1">Resolved this week</p>
      </div>
    </div>
  );
};

export default BugStats;
