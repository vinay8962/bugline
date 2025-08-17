import React from "react";
import { Building2, Crown, User, Users, Calendar } from "lucide-react";

const CompanyCard = ({ company, role, joinDate, isPrimary = false }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getRoleColor = (role) => {
    switch (role) {
      case "ADMIN":
        return "text-yellow-400 bg-yellow-400/10 border-yellow-400/20";
      case "DEVELOPER":
        return "text-blue-400 bg-blue-400/10 border-blue-400/20";
      case "QA":
        return "text-green-400 bg-green-400/10 border-green-400/20";
      default:
        return "text-gray-400 bg-gray-400/10 border-gray-400/20";
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case "ADMIN":
        return <Crown className="w-4 h-4" />;
      case "DEVELOPER":
        return <User className="w-4 h-4" />;
      case "QA":
        return <Users className="w-4 h-4" />;
      default:
        return <User className="w-4 h-4" />;
    }
  };

  return (
    <div className="bg-gray-800/0 border border-gray-700 rounded-lg p-6 hover:border-gray-600 transition-colors relative group">
      {isPrimary && (
        <div className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
          Primary
        </div>
      )}

      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center">
            {company.logo ? (
              <img
                src={company.logo}
                alt={`${company.name} logo`}
                className="w-8 h-8 rounded object-cover"
              />
            ) : (
              <Building2 className="w-6 h-6 text-gray-400" />
            )}
          </div>
          <div>
            <h3 className="text-white font-semibold text-lg">{company.name}</h3>
            <p className="text-gray-400 text-sm">{company.description}</p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-gray-400 text-sm">Role</span>
          <span
            className={`px-2 py-1 rounded-full text-xs border flex items-center gap-1 ${getRoleColor(
              role
            )}`}
          >
            {getRoleIcon(role)}
            {role}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-gray-400 text-sm">Employees</span>
          <span className="text-white text-sm">
            {company.employees_count || 0}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-gray-400 text-sm">Joined</span>
          <span className="text-white text-sm flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {formatDate(joinDate)}
          </span>
        </div>
      </div>

      {/* <div className="mt-4 pt-4 border-t border-gray-700">
        <button className="w-full text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors">
          View Details →
        </button>
      </div> */}
    </div>
  );
};

export default CompanyCard;
