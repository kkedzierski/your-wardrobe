export type EditClothDTO = {
  clothId: number;
  userId?: string;
  patch: {
    name?: string;
    description?: string;
    color?: string;
    brand?: string;
    location?: string;
    categoryId: number;
    tagIds?: number[];
  };
};
