export interface Category {
  id: number;
  user_id: number;
  name: string;
  created_at: number;
  updated_at: number;
  deleted_at?: number | null;
}
