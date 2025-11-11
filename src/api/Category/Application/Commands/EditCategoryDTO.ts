export type EditCategoryDTO = {
  categoryId: number;
  userId?: string;
  patch: {
    name?: string;
  };
};
