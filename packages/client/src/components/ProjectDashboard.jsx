import React from "react";
import { FolderPlus, Bug, Plus, ArrowLeft, AlertTriangle, Clock, CheckCircle } from "lucide-react";
import { useGetProjectDetailsQuery } from "../services/projectApi.js";
import LoadingSpinner from "./LoadingSpinner.jsx";

const ProjectDashboard = ({ projectId, onBack }) => {
  const { data: projectDetails, isLoading, error } = useGetProjectDetailsQuery(projectId, { skip: !projectId });
  const project = projectDetails?.data;
  if (isLoading) return <LoadingSpinner />;
  if (error) return <div className="text-center py-12 text-red-400">Failed to load project details</div>;
  const stats = {
    total: project?.stats?.total || 0,
    open: project?.stats?.open || 0,
    in_progress: project?.stats?.in_progress || 0,
    resolved: project?.stats?.resolved || 0,
    critical: project?.stats?.critical || 0,
  };
  return (
    <div className="bg-primary min-h-screen relative pb-10">
      {/* Header */}
      <header className="border-b border-gray-700/30 bg-primary/5 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button onClick={onBack} className="p-2 border border-gray-600/40 rounded-xl flex items-center justify-center hover:bg-gray-700 transition">
                <ArrowLeft className="h-4 w-4 text-white" />
              </button>
              <div className="flex items-center gap-4">
                <div className="bg-blue-600 p-2 rounded-lg shadow-md">
                  <FolderPlus className="h-6 w-6 text-white" />
                </div>
                <div className="hidden md:block">
                  <h1 className="text-2xl font-bold bg-blue-600 bg-clip-text text-transparent">{project?.name}</h1>
                  <p className="text-sm text-gray-400">Project Dashboard • {project?.company?.name}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
                <Plus className="h-4 w-4" />
                New Bug
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Widget Integration Section */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white/5 border border-indigo-600 rounded-lg p-6 mb-8">
          <h2 className="text-lg font-bold text-indigo-300 mb-2">Widget Integration</h2>
          <p className="text-sm text-gray-300 mb-4">Embed the BugLine widget in your app to enable instant bug reporting for users and auto-capture of JavaScript errors.</p>
          <div className="bg-black/60 rounded p-4 text-xs text-gray-100 mb-4 overflow-x-auto">
            <span className="font-semibold text-indigo-400">Project Token:</span> <span className="font-mono text-green-400">{project?.widgetToken || 'YOUR_PROJECT_TOKEN'}</span>
            <br /><br />
            <span className="font-semibold text-indigo-400">Embed Script:</span>
            <pre className="whitespace-pre-wrap mt-2 text-xs bg-black/30 p-2 rounded">{`<script src="https://cdn.bugline.co/widget/v1/widget.min.js"></script>
<script>
  BugLine.init({
    projectToken: '${project?.widgetToken || "YOUR_PROJECT_TOKEN"}',
    position: 'bottom-right',
    autoErrorCapture: true
  });
</script>`}</pre>
          </div>
          <ul className="list-disc pl-6 text-sm text-gray-200 mb-2">
            <li><span className="font-semibold text-indigo-300">projectToken</span>: Unique per project. Required for authentication and bug submission.</li>
            <li><span className="font-semibold text-indigo-300">position</span>: Floating button position. Options: <span className="font-mono">bottom-right</span>, <span className="font-mono">bottom-left</span>, <span className="font-mono">top-right</span>, <span className="font-mono">top-left</span>, <span className="font-mono">center-right</span>, <span className="font-mono">center-left</span>.</li>
            <li><span className="font-semibold text-indigo-300">autoErrorCapture</span>: Enable automatic JS error reporting.</li>
            <li><span className="font-semibold text-indigo-300">customCSS</span>: (Optional) Custom styling for widget button/modal.</li>
            <li><span className="font-semibold text-indigo-300">Callbacks</span>: <span className="font-mono">onLoad</span>, <span className="font-mono">onBugReported</span>, <span className="font-mono">onError</span> for advanced usage.</li>
          </ul>
          <p className="text-xs text-gray-400 mt-2">For local testing, use the <span className="font-mono">widget.min.js</span> from <span className="font-mono">/packages/widget/dist/</span> and set <span className="font-mono">projectToken</span> to your test project token.</p>
        </div>

        {/* Project Stats */}
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

        {/* Bug Report Navigation Button */}
        <div className="flex justify-center mt-8">
          <a href="/dashboard/bug-report" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
            <Bug className="w-5 h-5" />
            Go to Bug Reports
          </a>
        </div>
      </div>
    </div>
  );
};

export default ProjectDashboard;