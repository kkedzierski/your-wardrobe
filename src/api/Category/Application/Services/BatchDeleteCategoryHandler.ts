import type { BatchDeleteCategoryDTO } from "../Commands/BatchDeleteCategoryDTO";
import { deleteCategoriesBatch } from "../../Infrastructure/CategoryRepository";

export async function processBatchDeleteCategory(dto: BatchDeleteCategoryDTO) {
  return deleteCategoriesBatch(dto.categoryIds, dto.userId);
}
