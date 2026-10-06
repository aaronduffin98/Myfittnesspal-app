import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Cache, CACHE_KEYS } from "@/lib/cache";
import { dailyGoals } from "@/lib/constants";
import { useAuth } from "@/providers/AuthProvider";

export interface Goals {
  calories: number;
  carbs: number;
  fat: number;
  protein: number;
}

const DEFAULT_GOALS: Goals = { ...dailyGoals };

function goalsQueryKey(userId: string | undefined) {
  return ["goals", userId] as const;
}

/**
 * The signed-in user's daily targets. Falls back to the built-in defaults
 * until the user saves their own, and shows the last known values offline.
 */
export function useGoals(): Goals {
  const { user, status } = useAuth();

  const { data } = useQuery({
    queryKey: goalsQueryKey(user?.id),
    enabled: status === "authenticated",
    initialData: () => Cache.get<Goals>(CACHE_KEYS.GOALS) ?? undefined,
    queryFn: async () => {
      const response = await api.api.goals.$get();
      if (!response.ok) throw new Error("Failed to load goals");
      const { goals } = await response.json();
      const resolved = goals ?? DEFAULT_GOALS;
      Cache.set(CACHE_KEYS.GOALS, resolved);
      return resolved;
    },
  });

  return data ?? DEFAULT_GOALS;
}

export function useSaveGoals() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (goals: Goals) => {
      const response = await api.api.goals.$put({ json: goals });
      if (!response.ok) throw new Error("Failed to save goals");
      const { goals: saved } = await response.json();
      return saved;
    },
    onSuccess: (saved) => {
      Cache.set(CACHE_KEYS.GOALS, saved);
      queryClient.setQueryData(goalsQueryKey(user?.id), saved);
    },
  });
}
