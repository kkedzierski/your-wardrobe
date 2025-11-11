// src/api/Cloth/Application/Commands/ClothsCollectionDTO.ts
import { Cloth } from "../../Domain/Cloth";

export type ClothsCollectionDTO = {
  userId?: string;
  cloths: Cloth[];
};
