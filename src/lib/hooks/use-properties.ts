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

async function fetchProperty(id: string): Promise<Property> {
  const res = await fetch(`/api/properties/${id}`);
  if (!res.ok) throw new Error("Erreur réseau");
  return res.json() as Promise<Property>;
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

async function updateProperty({ id, ...data }: CreatePropertyInput & { id: string }): Promise<Property> {
  const res = await fetch(`/api/properties/${id}`, {
    method: "PATCH",
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

export function useProperty(id: string) {
  return useQuery({
    queryKey: ["properties", id],
    queryFn: () => fetchProperty(id),
    enabled: !!id,
  });
}

export function useCreateProperty() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createProperty,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["properties"] });
    },
  });
}

export function useUpdateProperty() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateProperty,
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: ["properties"] });
      void queryClient.invalidateQueries({ queryKey: ["properties", variables.id] });
    },
  });
}
