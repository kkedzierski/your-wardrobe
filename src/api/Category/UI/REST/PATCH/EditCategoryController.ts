import { Api, ApiErrorCode } from "../../../../../Kernel/ApiResponse";
import { processEditCategory } from "../../../../Application/Services/EditCategoryHandler";
import { EditCategoryInput } from "./EditCategoryInput";

const M = {
  BAD_INPUT: "Invalid request.",
  NOT_FOUND: "Category was not found.",
  FAILED: "Failed to update category.",
  SUCCESS: "Category updated.",
};

export async function editCategory(input: EditCategoryInput) {
  try {
    if (!input?.categoryId || input.categoryId <= 0) {
      return Api.error(ApiErrorCode.BAD_REQUEST, M.BAD_INPUT);
    }
    const { updated } = await processEditCategory({
      categoryId: input.categoryId,
      userId: input.userId,
      patch: {
        name: input.name,
      },
    });
    if (!updated) {
      return Api.error(ApiErrorCode.NOT_FOUND, M.NOT_FOUND);
    }
    return Api.ok(updated, M.SUCCESS);
  } catch (e) {
    return Api.error(ApiErrorCode.INTERNAL, M.FAILED);
  }
}
