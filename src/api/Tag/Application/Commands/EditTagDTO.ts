export type EditTagDTO = {
  tagId: number;
  userId?: string;
  patch: {
    name?: string;
  };
};
