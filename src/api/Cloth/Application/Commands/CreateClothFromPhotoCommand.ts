export interface CreateClothFromPhotoCommand {
  photo: Blob;
  name?: string;
  description?: string;
  category_id?: number;
  color?: string;
  brand?: string;
  season?: string;
  location?: string;
  tags?: number[];
  ai_suggestions?: boolean;
  userId: number;
}
