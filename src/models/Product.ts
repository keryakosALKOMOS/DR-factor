export interface IProduct {
  id?: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  images: string[];
  sizes: string[];
  colors: string[];
  category: string; // ID of the category
  isFeatured: boolean;
  stock: number;
  createdAt?: string;
  updatedAt?: string;
}
