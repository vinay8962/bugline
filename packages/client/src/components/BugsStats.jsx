import React from "react";
import {
  Bug,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
} from "lucide-react";

const BugsStats = ({ stats }) => {
  const statCards = [
    {
      title: "Total Bugs",
      value: stats.total,
      icon: Bug,
      color: "bg-slate-600",
      iconColor: "text-slate-300",
      description: "All reported issues",
    },
    {
      title: "Open Bugs",
      value: stats.open,
      icon: AlertTriangle,
      color: "bg-orange-500",
      iconColor: "text-white",
      description: "Requires attention",
    },
    {
      title: "In Progress",
      value: stats.inProgress,
      icon: Clock,
      color: "bg-blue-500",
      iconColor: "text-white",
      description: "Being worked on",
    },
    {
      title: "Resolved",
      value: stats.fixed,
      icon: CheckCircle,
      color: "bg-emerald-500",
      iconColor: "text-white",
      description: "Successfully fixed",
    },
  ];

  const getProgressPercentage = () => {
    if (stats.total === 0) return 0;
    return Math.round((stats.fixed / stats.total) * 100);
  };

  return (
    <div className="space-y-8">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div
            key={index}
            className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 backdrop-blur-sm hover:border-slate-600/50 transition-all duration-300 hover:shadow-xl hover:shadow-slate-900/20"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl ${stat.color}`}>
                <stat.icon className={`h-6 w-6 ${stat.iconColor}`} />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-white">
                  {stat.value}
                </div>
                <div className="text-sm text-slate-400">{stat.title}</div>
              </div>
            </div>
            <p className="text-slate-400 text-sm">{stat.description}</p>
          </div>
        ))}
      </div>

      {/* Progress Overview */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-8 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-white mb-2">
              Resolution Progress
            </h3>
            <p className="text-slate-400">
              Track how many bugs have been resolved
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-emerald-400">
              {getProgressPercentage()}%
            </div>
            <div className="text-sm text-slate-400">Completion Rate</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-700 rounded-full h-3 mb-4">
          <div
            className="bg-emerald-500 h-3 rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${getProgressPercentage()}%` }}
          ></div>
        </div>

        {/* Progress Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-400 mb-1">
              {stats.open}
            </div>
            <div className="text-sm text-slate-400">Still Open</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400 mb-1">
              {stats.inProgress}
            </div>
            <div className="text-sm text-slate-400">In Progress</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-emerald-400 mb-1">
              {stats.fixed}
            </div>
            <div className="text-sm text-slate-400">Resolved</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-8 backdrop-blur-sm">
        <h3 className="text-xl font-bold text-white mb-6">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors duration-200 flex items-center space-x-3 group">
            <div className="p-2 bg-blue-500 rounded-lg group-hover:scale-110 transition-transform duration-200">
              <Bug className="h-5 w-5" />
            </div>
            <div className="text-left">
              <div className="font-medium">Report Bug</div>
              <div className="text-sm text-blue-100">Create new issue</div>
            </div>
          </button>

          <button className="p-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-colors duration-200 flex items-center space-x-3 group">
            <div className="p-2 bg-emerald-500 rounded-lg group-hover:scale-110 transition-transform duration-200">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div className="text-left">
              <div className="font-medium">View Analytics</div>
              <div className="text-sm text-emerald-100">
                Performance insights
              </div>
            </div>
          </button>

          <button className="p-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-colors duration-200 flex items-center space-x-3 group">
            <div className="p-2 bg-purple-500 rounded-lg group-hover:scale-110 transition-transform duration-200">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div className="text-left">
              <div className="font-medium">Priority Queue</div>
              <div className="text-sm text-purple-100">High priority bugs</div>
            </div>
          </button>
        </div>
      </div>

      {/* Recent Activity Placeholder */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-8 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">Recent Activity</h3>
          <button className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors duration-200">
            View All
          </button>
        </div>

        <div className="space-y-4">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="flex items-center space-x-4 p-4 bg-slate-700/30 rounded-xl border border-slate-600/30"
            >
              <div className="w-10 h-10 bg-slate-600 rounded-full flex items-center justify-center">
                <Bug className="h-5 w-5 text-slate-300" />
              </div>
              <div className="flex-1">
                <div className="text-white font-medium">
                  Bug #{1000 + item} reported
                </div>
                <div className="text-sm text-slate-400">2 hours ago</div>
              </div>
              <div className="px-3 py-1 bg-orange-100 text-orange-800 text-xs rounded-full border border-orange-200">
                Open
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BugsStats;
