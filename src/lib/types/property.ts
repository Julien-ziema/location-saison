export interface Property {
  id: string;
  userId: string;
  name: string;
  address: string;
  description: string | null;
  capacity: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  surface: number | null;
  amenities: string[] | null;
  photos: string[] | null;
  pricePerNight: number | null;
  defaultDepositPercent: number | null;
  defaultCautionAmount: number | null;
  createdAt: Date;
  deletedAt: Date | null;
}

export interface CreatePropertyInput {
  name: string;
  address: string;
  description?: string;
  capacity?: number;
  bedrooms?: number;
  bathrooms?: number;
  surface?: number;
  amenities?: string[];
  photos?: string[];
  pricePerNight?: number;
  defaultDepositPercent?: number;
  defaultCautionAmount?: number;
}

export const AMENITIES_OPTIONS = [
  { value: "wifi", label: "Wi-Fi" },
  { value: "pool", label: "Piscine" },
  { value: "parking", label: "Parking" },
  { value: "garden", label: "Jardin" },
  { value: "terrace", label: "Terrasse" },
  { value: "bbq", label: "Barbecue" },
  { value: "ac", label: "Climatisation" },
  { value: "heating", label: "Chauffage" },
  { value: "washer", label: "Lave-linge" },
  { value: "dryer", label: "Sèche-linge" },
  { value: "dishwasher", label: "Lave-vaisselle" },
  { value: "tv", label: "Télévision" },
  { value: "pet_friendly", label: "Animaux acceptés" },
  { value: "sea_view", label: "Vue mer" },
  { value: "mountain_view", label: "Vue montagne" },
  { value: "balcony", label: "Balcon" },
  { value: "elevator", label: "Ascenseur" },
  { value: "fireplace", label: "Cheminée" },
] as const;
