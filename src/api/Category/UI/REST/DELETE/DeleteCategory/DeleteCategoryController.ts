import { Api, ApiErrorCode } from "../../../../../Kernel/ApiResponse";
import { DeleteCategoryInput } from "./DeleteCategoryInput";
import { processDeleteCategory } from "../../../../Application/Services/DeleteCategoryHandler";

const M = {
  BAD_INPUT: "Invalid request.",
  NOT_FOUND: "Category was not found.",
  FAILED: "Failed to delete category.",
  SUCCESS: "Category deleted.",
};

export async function deleteCategory(input: DeleteCategoryInput) {
  try {
    if (!input?.categoryId || input.categoryId <= 0) {
      return Api.error(ApiErrorCode.BAD_REQUEST, M.BAD_INPUT);
    }
    const { deleted } = await processDeleteCategory({
      categoryId: input.categoryId,
      userId: input.userId,
    });
    if (!deleted) {
      return Api.error(ApiErrorCode.NOT_FOUND, M.NOT_FOUND);
    }
    return Api.ok<{ categoryId: number }>(
      { categoryId: input.categoryId },
      M.SUCCESS
    );
  } catch (e) {
    return Api.error(ApiErrorCode.INTERNAL, M.FAILED);
  }
}
