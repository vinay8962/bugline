;
import { Building2, Plus, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const AddFirstCompany = () => {
  return (
    <div className="bg-primary border border-gray-800 rounded-lg p-6 text-center">
      <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
        <Building2 className="w-8 h-8 text-white" />
      </div>
      
      <h3 className="text-xl font-semibold text-white mb-2">
        No Companies Yet
      </h3>
      
      <p className="text-gray-400 mb-6 max-w-md mx-auto">
        You haven't joined any companies yet. Create your first company to start managing bugs and collaborating with your team.
      </p>
      
      <div className="space-y-3">
        <Link
          to="/add-company"
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Create Your First Company
          <ArrowRight className="w-4 h-4" />
        </Link>
        
        <p className="text-sm text-gray-500">
          Or ask your team admin to invite you to an existing company
        </p>
      </div>
    </div>
  );
};

export default AddFirstCompany; 