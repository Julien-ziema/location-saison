export interface Property {
  id: string;
  userId: string;
  name: string;
  address: string;
  description: string | null;
  createdAt: Date;
  deletedAt: Date | null;
}

export interface CreatePropertyInput {
  name: string;
  address: string;
  description?: string;
}
