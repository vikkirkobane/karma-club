
import React from 'react';
import { useAuth } from "@/contexts/AuthContext";
import { Auth } from "@/pages/Auth";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading only while we're determining auth status
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center">
        <LoadingSkeleton />
      </div>
    );
  }

  // Show auth page if not authenticated
  if (!isAuthenticated) {
    return <Auth />;
  }

  // Show protected content if authenticated
  return <>{children}</>;
};
