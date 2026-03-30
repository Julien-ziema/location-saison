import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import type { Property, CreatePropertyInput } from "@/lib/types/property";

async function fetchProperties(): Promise<Property[]> {
  const res = await fetch("/api/properties");
  if (!res.ok) throw new Error("Erreur réseau");
  return res.json() as Promise<Property[]>;
}

async function createProperty(data: CreatePropertyInput): Promise<Property> {
  const res = await fetch("/api/properties", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Erreur réseau");
  return res.json() as Promise<Property>;
}

export function useProperties() {
  return useQuery({
    queryKey: ["properties"],
    queryFn: fetchProperties,
  });
}

export function useCreateProperty() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createProperty,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["properties"] });
    },
    onError: (error: Error) => {
      console.error("useCreateProperty error:", error);
    },
  });
}
