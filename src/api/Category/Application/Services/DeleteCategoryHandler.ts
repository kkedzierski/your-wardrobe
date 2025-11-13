import { DeleteCategoryDTO } from "../Commands/DeleteCategoryDTO";
import { deleteCategory as repoDeleteCategory } from "../../Infrastructure/CategoryRepository";
import { ResourceMutationStatus } from "../../../Kernel/ResourceMutationStatus";

export async function processDeleteCategory(
  dto: DeleteCategoryDTO
): Promise<{ status: ResourceMutationStatus }> {
  const status = await repoDeleteCategory(dto.categoryId, dto.userId);
  return { status };
}
