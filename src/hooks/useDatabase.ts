import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const API = "";

export function usePosts() {
  return useQuery({ queryKey: ["posts"], queryFn: () => fetch(`${API}/api/posts`).then(r => r.json()) });
}

export function usePost(id: string) {
  return useQuery({ queryKey: ["post", id], queryFn: () => fetch(`${API}/api/posts/${id}`).then(r => r.json()), enabled: !!id });
}
