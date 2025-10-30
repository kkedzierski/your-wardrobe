export interface Cloth {
  id: number;
  user_id: number;
  name: string;
  description?: string | null;
  category_id: number;
  color?: string | null;
  brand?: string | null;
  season?: string | null;
  location?: string | null;
  created_at: number;
  updated_at: number;
  deleted_at?: number | null;
}
