
import React from "react";
// import { useSelector } from "react-redux"; // Uncomment if using Redux
// import { useGetBugsQuery } from "../../redux/services/bugApi"; // Uncomment if using RTK Query

const bugs = [
  {
    id: 1,
    title: "Login button not working",
    description: "The login button does not respond on click.",
    priority: "high",
    status: "open",
    reporter: { full_name: "Alice" },
    created_at: "2025-08-08T10:00:00Z",
  },
  {
    id: 2,
    title: "UI glitch on dashboard",
    description: "Dashboard widgets overlap on mobile view.",
    priority: "medium",
    status: "in_progress",
    reporter: { full_name: "Bob" },
    created_at: "2025-08-07T14:30:00Z",
  },
];

const BugReport = () => {
  // const { data: bugs = [], isLoading } = useGetBugsQuery(); // Example for RTK Query
  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold text-blue-600 mb-6">Bug Reports</h1>
      <div className="space-y-4">
        {bugs.length === 0 ? (
          <div className="text-center py-12">
            <h4 className="text-lg font-semibold text-gray-700 mb-2">No Bugs Yet</h4>
            <p className="text-gray-400 mb-6 max-w-md mx-auto">
              This project doesn't have any bug reports yet. Get started by integrating the BugLine widget!
            </p>
          </div>
        ) : (
          bugs.map((bug) => (
            <div key={bug.id} className="border border-gray-300 rounded-lg p-4 bg-white shadow">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-semibold text-blue-600">{bug.title}</span>
                <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-600 ml-2">{bug.priority}</span>
                <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600 ml-2">{bug.status}</span>
              </div>
              <p className="text-sm text-gray-700 mb-2">{bug.description}</p>
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span>Reported by {bug.reporter?.full_name || "Unknown"}</span>
                <span>{new Date(bug.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default BugReport;
