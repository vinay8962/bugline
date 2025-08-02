;
import { Building2, Users, Calendar } from "lucide-react";

const CompanyCard = ({ company, role, joinDate, isPrimary = false }) => {
  return (
    <div className={`bg-primary border border-gray-800 rounded-lg p-4 ${isPrimary ? 'ring-2 ring-blue-500' : ''}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-white font-semibold">{company.name}</h3>
            <p className="text-sm text-gray-400">{company.slug}</p>
          </div>
        </div>
        {isPrimary && (
          <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
            Primary
          </span>
        )}
      </div>
      
      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2 text-gray-400">
          <Users className="w-4 h-4" />
          <span>Role: {role}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-400">
          <Calendar className="w-4 h-4" />
          <span>Joined: {new Date(joinDate).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
};

export default CompanyCard; 