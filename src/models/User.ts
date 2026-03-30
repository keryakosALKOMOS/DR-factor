export interface IUser {
  id?: string;
  name: string;
  email: string;
  password?: string;
  role: "user" | "admin";
  phone?: string;
  address?: string;
  fcmTokens?: string[];
  createdAt?: string;
  updatedAt?: string;
}
