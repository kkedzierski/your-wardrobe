export type EditClothInput = {
  clothId: number; // wymagane
  userId?: string; // wymagane
  name?: string;
  description?: string;
  color?: string;
  brand?: string;
  location?: string;
  categoryId?: number;
  tagIds?: number[];
};
