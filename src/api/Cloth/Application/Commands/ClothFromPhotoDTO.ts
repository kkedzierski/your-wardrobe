export interface ClothFromPhotoDTO {
  id: number;
  name: string;
  photos: Array<{
    id: number;
    cloth_id: number;
    user_id: number;
    file_path: string;
    hash: string;
    main: boolean;
    created_at: number;
    deleted_at: number | null;
  }>;
  ai_suggestions?: {
    name?: string;
    category?: string;
    season?: string;
    [key: string]: string | undefined;
  };
}
