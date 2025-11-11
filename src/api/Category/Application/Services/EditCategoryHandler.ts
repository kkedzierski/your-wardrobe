import { EditCategoryDTO } from "../Commands/EditCategoryDTO";
import { updateCategory } from "../../Infrastructure/CategoryRepository";

export async function processEditCategory(dto: EditCategoryDTO): Promise<{
  updated: null | {
    categoryId: number;
    name?: string;
    updatedAt: string;
  };
}> {
  const rec = await updateCategory(dto.categoryId, dto.patch, dto.userId);
  return { updated: rec };
}
