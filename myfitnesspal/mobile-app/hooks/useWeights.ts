import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Cache, CACHE_KEYS } from "@/lib/cache";
import { useAuth } from "@/providers/AuthProvider";

export interface WeightEntry {
  id: string;
  weightKg: number;
  loggedDate: string;
  createdAt: string;
  updatedAt: string;
}

function weightsQueryKey(userId: string | undefined) {
  return ["weights", userId] as const;
}

/** Today's date in the phone's own time zone, as YYYY-MM-DD. */
export function localTodayIso(): string {
  const d = new Date();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${month}-${day}`;
}

/** All of the signed-in user's weigh-ins, oldest first. */
export function useWeights() {
  const { user, status } = useAuth();

  return useQuery({
    queryKey: weightsQueryKey(user?.id),
    enabled: status === "authenticated",
    initialData: () => Cache.get<WeightEntry[]>(CACHE_KEYS.WEIGHTS) ?? undefined,
    queryFn: async () => {
      const response = await api.api.weights.$get();
      if (!response.ok) throw new Error("Failed to load weights");
      const { items } = await response.json();
      Cache.set(CACHE_KEYS.WEIGHTS, items);
      return items as WeightEntry[];
    },
  });
}

function useInvalidateWeights() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  return () =>
    queryClient.invalidateQueries({ queryKey: weightsQueryKey(user?.id) });
}

/** Logs a weigh-in. Logging twice on the same day replaces the first one. */
export function useLogWeight() {
  const invalidate = useInvalidateWeights();

  return useMutation({
    mutationFn: async (input: { weightKg: number; loggedDate: string }) => {
      const response = await api.api.weights.$post({ json: input });
      if (!response.ok) throw new Error("Failed to log weight");
      return (await response.json()) as WeightEntry;
    },
    onSuccess: invalidate,
  });
}

export function useDeleteWeight() {
  const invalidate = useInvalidateWeights();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.api.weights[":id"].$delete({ param: { id } });
      if (!response.ok) throw new Error("Failed to delete weight");
    },
    onSuccess: invalidate,
  });
}
