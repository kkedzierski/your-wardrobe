export type EditClothDTO = {
  clothId: number;
  userId?: string;
  patch: {
    description?: string;
    color?: string;
    brand?: string;
    location?: string;
    // future:
    // categoryIds?: number[];
    // tagIds?: number[];
  };
};
