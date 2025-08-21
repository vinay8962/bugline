import React from "react";
import {
  BarChart3,
  TrendingUp,
  AlertCircle,
  Activity,
  Clock,
  Target,
  CheckCircle2,
  Zap,
} from "lucide-react";

const BugsStats = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Total Bugs */}
      <div className="bg-gray-800/20 text-white border border-gray-800 rounded-lg p-6 hover:shadow-lg transition-all duration-500 hover:scale-105 group">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm font-medium">Total Bugs</p>
            <p className="text-3xl font-bold mt-2 tracking-tight">
              {stats.totalBugs || 0}
            </p>
          </div>
          <div className="p-3 bg-blue-900/50 rounded-2xl group-hover:bg-blue-800 transition">
            <BarChart3 className="w-6 h-6 text-blue-400" />
          </div>
        </div>
        <div className="flex items-center gap-2 mt-4 text-xs">
          <TrendingUp className="w-3 h-3 text-green-400" />
          <span className="text-green-400 font-medium">
            +12% from last month
          </span>
        </div>
      </div>

      {/* Open Bugs */}
      <div className="bg-gray-800/20 text-white border border-gray-800 rounded-lg p-6 hover:shadow-lg transition-all duration-500 hover:scale-105 group">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm font-medium">Open Bugs</p>
            <p className="text-3xl font-bold mt-2 tracking-tight">
              {stats.openBugs || 0}
            </p>
          </div>
          <div className="p-3 bg-yellow-900/50 rounded-2xl group-hover:bg-yellow-800 transition">
            <AlertCircle className="w-6 h-6 text-yellow-400" />
          </div>
        </div>
        <div className="flex items-center gap-2 mt-4 text-xs">
          <Activity className="w-3 h-3 text-yellow-400" />
          <span className="text-yellow-400 font-medium">Needs attention</span>
        </div>
      </div>

      {/* In Progress */}
      <div className="bg-gray-800/20 text-white border border-gray-800 rounded-lg p-6 hover:shadow-lg transition-all duration-500 hover:scale-105 group">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm font-medium">In Progress</p>
            <p className="text-3xl font-bold mt-2 tracking-tight">
              {stats.inProgressBugs || 0}
            </p>
          </div>
          <div className="p-3 bg-indigo-900/50 rounded-2xl group-hover:bg-indigo-800 transition">
            <Clock className="w-6 h-6 text-indigo-400" />
          </div>
        </div>
        <div className="flex items-center gap-2 mt-4 text-xs">
          <Target className="w-3 h-3 text-indigo-400" />
          <span className="text-indigo-400 font-medium">Being worked on</span>
        </div>
      </div>

      {/* Resolved */}
      <div className="bg-gray-800/20 text-white border border-gray-800 rounded-lg p-6 hover:shadow-lg transition-all duration-500 hover:scale-105 group">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm font-medium">Resolved</p>
            <p className="text-3xl font-bold mt-2 tracking-tight">
              {stats.resolvedBugs || 0}
            </p>
          </div>
          <div className="p-3 bg-green-900/50 rounded-2xl group-hover:bg-green-800 transition">
            <CheckCircle2 className="w-6 h-6 text-green-400" />
          </div>
        </div>
        <div className="flex items-center gap-2 mt-4 text-xs">
          <Zap className="w-3 h-3 text-green-400" />
          <span className="text-green-400 font-medium">Great progress!</span>
        </div>
      </div>
    </div>
  );
};

export default React.memo(BugsStats);
