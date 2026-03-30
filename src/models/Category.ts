export interface ICategory {
  id?: string;
  name: string;
  slug: string;
  parent?: string | null;
  createdAt?: string;
  updatedAt?: string;
}
