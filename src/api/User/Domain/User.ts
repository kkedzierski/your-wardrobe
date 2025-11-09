export interface User {
  id: string;
  kind: string;
  email: string;
  role: string;
  created_at: number;
  updated_at: number;
  deleted_at?: number | null;
}
