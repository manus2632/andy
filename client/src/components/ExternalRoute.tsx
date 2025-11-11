import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuthNew } from "@/hooks/useAuthNew";

/**
 * Route-Guard für externe User
 * Externe User werden automatisch zum Konfigurator umgeleitet
 */
export function ExternalRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuthNew();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!loading && user?.role === "extern") {
      setLocation("/konfigurator");
    }
  }, [user, loading, setLocation]);

  // Während des Ladens oder wenn User extern ist, nichts rendern
  if (loading || user?.role === "extern") {
    return null;
  }

  return <>{children}</>;
}
