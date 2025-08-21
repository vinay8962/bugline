import React from "react";
import {
  Building2,
  Sparkles,
  Users,
  FolderPlus,
  Calendar,
  Plus,
} from "lucide-react";

const CompanyHeader = ({
  company,
  projects,
  isAdmin,
  setShowCreateProject,
}) => {
  return (
    <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 border border-gray-700/30 backdrop-blur-xl overflow-hidden relative shadow-xl animate-fade-in-up rounded-2xl">
      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-radial from-indigo-500/20 via-transparent to-transparent opacity-20" />
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-400/10 rounded-full -translate-y-16 translate-x-16 blur-2xl" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-indigo-500/10 rounded-full translate-y-12 -translate-x-12 blur-xl" />

      <div className="relative p-8">
        <div className="flex items-start justify-between">
          {/* Left side */}
          <div className="flex items-center gap-6">
            <div className="p-5 bg-blue-600/30 backdrop-blur-sm rounded-xl border border-white/20 shadow-lg ">
              <Building2 className="w-8 h-8 text-blue-400" />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-4xl font-bold text-white tracking-tight">
                  {company?.name || "Company Dashboard"}
                </h1>
                <span className="flex items-center gap-1 px-2 py-1 rounded-md bg-green-500/20 text-green-400 border border-green-500/30 animate-pulse text-sm font-medium">
                  <Sparkles className="w-3 h-3" />
                  Active
                </span>
              </div>
              <p className="text-gray-300 text-lg font-mono">
                /{company?.slug}
              </p>

              {/* Stats */}
              <div className="flex items-center gap-6 mt-4 text-sm text-gray-300">
                <div className="flex items-center gap-2 hover:text-white transition">
                  <Users className="w-4 h-4" />
                  <span>{company?.company_users?.length || 0} members</span>
                </div>
                <div className="flex items-center gap-2 hover:text-white transition">
                  <FolderPlus className="w-4 h-4" />
                  <span>{projects?.length || 0} projects</span>
                </div>
                <div className="flex items-center gap-2 hover:text-white transition">
                  <Calendar className="w-4 h-4" />
                  <span>
                    Since{" "}
                    {company?.created_at
                      ? new Date(company.created_at).toLocaleDateString()
                      : "N/A"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right side (Admin button) */}

          <button
            onClick={() => setShowCreateProject(true)}
            className="bg-blue-600 text-white hover:bg-blue-700 gap-2 shadow-xl px-4 py-2 rounded-lg flex items-center transition-transform transform hover:scale-105 group"
          >
            <Plus className="w-4 h-4 transition-transform group-hover:rotate-90" />
            New Project
          </button>
        </div>
      </div>
    </div>
  );
};

export default CompanyHeader;
