import React from "react";
import { FolderPlus, ArrowUpRight } from "lucide-react";

const ProjectCard = ({ project, index, onClick }) => {
  return (
    <div
      key={project.id}
      onClick={() => {
        onClick(project.id); // ✅ call parent handler safely
      }}
      className="cursor-pointer group hover:shadow-xl transition-all duration-500 bg-white/0 border border-gray-800 hover:border-blue-500 animate-fade-in-up hover:scale-105 backdrop-blur-sm rounded-xl"
      style={{ animationDelay: `${0.1 * index}s` }}
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600/30 rounded-lg group-hover:bg-blue-600/40 transition">
              <FolderPlus className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-semibold text-white  transition">
                  {project.name}
                </h4>
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-medium 
                    bg-blue-600 text-white `}
                >
                  {/* {project.status}  */}
                  Active
                </span>
              </div>
              <p className="text-sm text-gray-500 font-mono">/{project.slug}</p>
            </div>
          </div>

          <ArrowUpRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition opacity-0 group-hover:opacity-100" />
        </div>

        {/* Bug Stats */}

        <div className="grid grid-cols-2 gap-3 text-sm mb-4">
          <div className="flex justify-between">
            <span className="text-gray-500">Total:</span>
            <span className="text-white font-medium">00</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Open:</span>
            <span className="text-yellow-600 font-medium">00</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Progress:</span>
            <span className="text-blue-600 font-medium">00</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Resolved:</span>
            <span className="text-green-600 font-medium">00</span>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-gray-800">
          <p className="text-xs text-gray-500">
            Created {new Date(project.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
