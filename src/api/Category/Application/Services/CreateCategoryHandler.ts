import { getActiveUserId } from "../../../../auth/ensureGuestUser";
import { insertCategory } from "../../Category/Infrastructure/CategoryRepository";
import { CreateCategoryCommand } from "../Commands/CreateCategoryCommand";
import { CreateCategoryDTO } from "../Commands/CreateCategoryDTO";

export async function createCategory(
  cmd: CreateCategoryCommand
): Promise<CreateCategoryDTO> {
  const userId = await getActiveUserId();
  const { categoryId } = await insertCategory({ userId, name: cmd.name });
  return {
    categoryId,
    name: cmd.name,
  };
}
