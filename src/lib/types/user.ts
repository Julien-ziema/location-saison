export type UserRole = "owner" | "admin";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: Date;
  deletedAt: Date | null;
}
