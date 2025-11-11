import { DeleteCategoryDTO } from "../Commands/DeleteCategoryDTO";
import { deleteCategory as repoDeleteCategory } from "../../Infrastructure/CategoryRepository";

export async function processDeleteCategory(
  dto: DeleteCategoryDTO
): Promise<{ deleted: boolean }> {
  const ok = await repoDeleteCategory(dto.categoryId, dto.userId);
  return { deleted: ok };
}
