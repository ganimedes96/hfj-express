export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  password: string;
  role: "admin" | "deliveryDrive";
  emailVerified: boolean;
  active: boolean;
  createdAt: Date;
  updatedAt?: Date;
}

export type CreateUser = Omit<User, "id" | "createdAt" | "updatedAt">

