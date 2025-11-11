import { useAuthNew } from "@/hooks/useAuthNew";
import { Redirect } from "wouter";
import { ReactNode } from "react";

interface AdminRouteProps {
  children: ReactNode;
}

export function AdminRoute({ children }: AdminRouteProps) {
  const { user, loading } = useAuthNew();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Laden...</div>
      </div>
    );
  }

  if (!user || user.rolle !== "admin") {
    return <Redirect to="/" />;
  }

  return <>{children}</>;
}
