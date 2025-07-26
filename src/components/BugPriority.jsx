import React from "react";
import { Bug } from "lucide-react";

const priorities = [
  {
    label: "Critical",
    description: "System breaking issues that need immediate attention",
    color: "red-500",
    bg: "bg-red-500/5",
    border: "border-red-500/30",
  },
  {
    label: "High",
    description: "Major functionality issues affecting user experience",
    color: "orange-500",
    bg: "bg-orange-500/5",
    border: "border-orange-500/30",
  },
  {
    label: "Medium",
    description: "Moderate issues that should be addressed soon",
    color: "yellow-500",
    bg: "bg-yellow-500/5",
    border: "border-yellow-500/30",
  },
  {
    label: "Low",
    description: "Minor issues and enhancements for future releases",
    color: "green-500",
    bg: "bg-green-500/5",
    border: "border-green-500/30",
  },
];

const BugPriority = () => {
  return (
    <section className="py-20 bg-primary backdrop-blur-sm text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Title */}
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-4xl font-bold">Smart Priority Management</h2>
          <p className="text-xl text-gray-400">
            Automatically categorize and prioritize bugs for efficient
            resolution
          </p>
        </div>

        {/* Priority Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {priorities.map((priority, index) => (
            <div
              key={index}
              className={`text-center p-6 rounded-xl border ${priority.border} ${priority.bg} hover:shadow-xl transition`}
            >
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center border ${priority.border} ${priority.bg} mx-auto mb-4`}
              >
                <Bug className={`h-6 w-6 text-${priority.color}`} />
              </div>
              <h3 className={`font-semibold text-${priority.color} mb-2`}>
                {priority.label}
              </h3>
              <p className="text-sm text-gray-300">{priority.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BugPriority;
