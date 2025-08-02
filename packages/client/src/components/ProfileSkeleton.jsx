import React from "react";

const ProfileSkeleton = () => {
  return (
    <div className="min-h-screen bg-primary p-6 md:px-20">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-gray-700 rounded-md animate-pulse"></div>
          <div>
            <div className="w-48 h-8 bg-gray-700 rounded animate-pulse mb-2"></div>
            <div className="w-64 h-4 bg-gray-700 rounded animate-pulse"></div>
          </div>
        </div>
        <div className="w-32 h-10 bg-gray-700 rounded-md animate-pulse"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Overview Skeleton */}
        <div className="bg-primary text-white p-6 border border-gray-800 rounded-lg shadow lg:col-span-1 text-center">
          <div className="relative mx-auto w-32 h-32 mb-4">
            <div className="w-full h-full bg-gray-700 rounded-full animate-pulse"></div>
          </div>
          <div className="w-40 h-6 bg-gray-700 rounded animate-pulse mx-auto mb-2"></div>
          <div className="w-32 h-4 bg-gray-700 rounded animate-pulse mx-auto mb-4"></div>
          <div className="space-y-2 text-sm text-gray-600 text-left">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-700 rounded animate-pulse"></div>
                <div className="w-48 h-4 bg-gray-700 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Profile Form Skeleton */}
        <div className="bg-primary text-white p-6 rounded-lg border border-gray-800 shadow lg:col-span-2">
          <div className="w-48 h-6 bg-gray-700 rounded animate-pulse mb-6"></div>
          
          <div className="space-y-6">
            {/* Personal Info Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2].map((i) => (
                <div key={i}>
                  <div className="w-20 h-4 bg-gray-700 rounded animate-pulse mb-2"></div>
                  <div className="w-full h-10 bg-gray-700 rounded animate-pulse"></div>
                </div>
              ))}
            </div>

            {/* Email Skeleton */}
            <div>
              <div className="w-16 h-4 bg-gray-700 rounded animate-pulse mb-2"></div>
              <div className="w-full h-10 bg-gray-700 rounded animate-pulse"></div>
            </div>

            {/* Phone Skeleton */}
            <div>
              <div className="w-20 h-4 bg-gray-700 rounded animate-pulse mb-2"></div>
              <div className="w-full h-10 bg-gray-700 rounded animate-pulse"></div>
            </div>

            {/* Bio Skeleton */}
            <div>
              <div className="w-12 h-4 bg-gray-700 rounded animate-pulse mb-2"></div>
              <div className="w-full h-24 bg-gray-700 rounded animate-pulse"></div>
            </div>

            {/* Work Info Skeleton */}
            <div className="border-t pt-4">
              <div className="w-40 h-6 bg-gray-700 rounded animate-pulse mb-4"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2].map((i) => (
                  <div key={i}>
                    <div className="w-24 h-4 bg-gray-700 rounded animate-pulse mb-2"></div>
                    <div className="w-full h-10 bg-gray-700 rounded animate-pulse"></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Location Skeleton */}
            <div className="border-t pt-4">
              <div className="w-48 h-6 bg-gray-700 rounded animate-pulse mb-4"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2].map((i) => (
                  <div key={i}>
                    <div className="w-20 h-4 bg-gray-700 rounded animate-pulse mb-2"></div>
                    <div className="w-full h-10 bg-gray-700 rounded animate-pulse"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSkeleton; 