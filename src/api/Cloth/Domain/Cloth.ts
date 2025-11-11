export type ClothId = number;

export type ClothCategory = {
  id: number;
  name: string;
};

export type ClothTag = {
  id: number;
  name: string;
};

export type Cloth = {
  id: ClothId;
  userId: string;
  name: string;
  description?: string | null;
  brand?: string | null;
  color?: string | null;
  season?: string | null;
  location?: string | null;
  category?: ClothCategory | null;
  tags: ClothTag[];
  createdAt?: number;
  updatedAt?: number;
};

export type NewClothWithPhotoDraft = {
  userId: string;
  filePath: string; // file://...
  hash: string;
  main?: 0 | 1;
  name?: string;
  description?: string | null;
};
