import { trpc } from "@/lib/trpc";

export function useAuthNew() {
  const { data: user, isLoading, error } = trpc.authNew.me.useQuery();

  return {
    user: user || null,
    isAuthenticated: !!user,
    loading: isLoading,
    error: error?.message || null,
  };
}
