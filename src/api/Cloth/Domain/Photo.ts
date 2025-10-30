export interface ClothPhoto {
  id: number;
  cloth_id: number;
  user_id: number;
  file_path: string;
  hash: string;
  main: boolean;
  created_at: number;
  deleted_at?: number | null;
}
