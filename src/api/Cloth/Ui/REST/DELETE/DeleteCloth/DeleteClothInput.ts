// src/api/Cloth/Ui/REST/DELETE/DeleteCloth/DeleteClothInput.ts
export type DeleteClothInput = {
  clothId: number;
  /** Opcjonalnie, jeśli chcesz twardo sprawdzać właściciela w Service/Repo */
  userId?: string;
};
