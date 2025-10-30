export interface CreateClothFromPhotoInput {
  photo: File | Blob; // wymagane zdjęcie
  name?: string;
  description?: string;
  category_id?: number;
  color?: string;
  brand?: string;
  season?: string;
  location?: string;
  tags?: number[];
  ai_suggestions?: boolean;
}
