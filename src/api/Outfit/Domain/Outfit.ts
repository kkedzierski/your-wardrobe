export interface Outfit {
  id: number;
  user_id: number;
  name?: string | null;
  description?: string | null;
  created_at: number;
  updated_at: number;
  deleted_at?: number | null;
}
