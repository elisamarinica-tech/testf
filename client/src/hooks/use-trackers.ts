import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { z } from "zod";

// Fetchers
export function useFamilies() {
  return useQuery({
    queryKey: [api.families.list.path],
    queryFn: async () => {
      const res = await fetch(api.families.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch families");
      return api.families.list.responses[200].parse(await res.json());
    },
  });
}

export function useTrackers() {
  return useQuery({
    queryKey: [api.trackers.list.path],
    queryFn: async () => {
      const res = await fetch(api.trackers.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch trackers");
      return api.trackers.list.responses[200].parse(await res.json());
    },
  });
}

export function useTrackerEntries(params?: { date?: string; month?: string }) {
  const queryStr = params ? new URLSearchParams(params as Record<string, string>).toString() : "";
  const path = `${api.trackerEntries.list.path}${queryStr ? `?${queryStr}` : ""}`;
  
  return useQuery({
    queryKey: [api.trackerEntries.list.path, params],
    queryFn: async () => {
      const res = await fetch(path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch entries");
      return api.trackerEntries.list.responses[200].parse(await res.json());
    },
  });
}

// Mutations
export function useCreateFamily() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: z.infer<typeof api.families.create.input>) => {
      const res = await fetch(api.families.create.path, {
        method: api.families.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create family");
      return api.families.create.responses[201].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.families.list.path] }),
  });
}

export function useCreateTracker() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: z.infer<typeof api.trackers.create.input>) => {
      const res = await fetch(api.trackers.create.path, {
        method: api.trackers.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create tracker");
      return api.trackers.create.responses[201].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.trackers.list.path] }),
  });
}

export function useDeleteTracker() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.trackers.delete.path, { id });
      const res = await fetch(url, { method: api.trackers.delete.method, credentials: "include" });
      if (!res.ok) throw new Error("Failed to delete tracker");
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.trackers.list.path] }),
  });
}

export function useToggleTrackerEntry() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ entryId, trackerId, date }: { entryId?: number; trackerId: number; date: string }) => {
      if (entryId) {
        // Delete existing entry
        const url = buildUrl(api.trackerEntries.delete.path, { id: entryId });
        const res = await fetch(url, { method: api.trackerEntries.delete.method, credentials: "include" });
        if (!res.ok) throw new Error("Failed to remove entry");
        return { action: 'deleted', id: entryId };
      } else {
        // Create new entry
        const res = await fetch(api.trackerEntries.create.path, {
          method: api.trackerEntries.create.method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ trackerId, date }),
          credentials: "include",
        });
        if (!res.ok) throw new Error("Failed to create entry");
        return { action: 'created', data: await res.json() };
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.trackerEntries.list.path] }),
  });
}

export function useUpdateTrackerEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: number; note?: string; photoUrl?: string }) => {
      const url = buildUrl(api.trackerEntries.update.path, { id });
      const res = await fetch(url, {
        method: api.trackerEntries.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update entry");
      return api.trackerEntries.update.responses[200].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.trackerEntries.list.path] }),
  });
}

export function useResetData() {
  const queryClient = useQueryClient();
  // This is a stub for reset data - typically you'd have a specific endpoint, 
  // but here we just clear the cache to simulate a fresh state for visual purposes
  // if a real endpoint isn't mapped
  return useMutation({
    mutationFn: async () => {
      // Stub: In a real app, call a /api/reset endpoint
      await new Promise(resolve => setTimeout(resolve, 800));
      return true;
    },
    onSuccess: () => {
      queryClient.clear();
      window.location.reload();
    },
  });
}
