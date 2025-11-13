import { Api, ApiErrorCode } from "../../../../../Kernel/ApiResponse";
import { DeleteCategoryInput } from "./DeleteCategoryInput";
import { processDeleteCategory } from "../../../../Application/Services/DeleteCategoryHandler";
import { ResourceMutationStatus } from "../../../../../Kernel/ResourceMutationStatus";
import { Logger } from "../../../../../Kernel/Logger";

const M = {
  BAD_INPUT: "Invalid request.",
  NOT_FOUND: "Category was not found.",
  IN_USE: "Category cannot be deleted because it is assigned to some clothes.",
  FAILED: "Failed to delete category.",
  SUCCESS: "Category deleted.",
};

export async function deleteCategory(input: DeleteCategoryInput) {
  try {
    if (!input?.categoryId || input.categoryId <= 0) {
      return Api.error(ApiErrorCode.BAD_REQUEST, M.BAD_INPUT);
    }

    const { status } = await processDeleteCategory({
      categoryId: input.categoryId,
      userId: input.userId,
    });

    switch (status) {
      case ResourceMutationStatus.SUCCESS:
        return Api.ok<{ categoryId: number }>(
          { categoryId: input.categoryId },
          M.SUCCESS
        );

      case ResourceMutationStatus.NOT_FOUND:
        return Api.error(ApiErrorCode.NOT_FOUND, M.NOT_FOUND);

      case ResourceMutationStatus.IN_USE:
        return Api.error(ApiErrorCode.CONFLICT, M.IN_USE);

      default:
        Logger.error("DeleteCategoryController unknown error.", {
          categoryId: input.categoryId,
        });
        return Api.error(ApiErrorCode.INTERNAL, M.FAILED);
    }
  } catch (e) {
    Logger.error("DeleteCategoryController error", { error: String(e) });
    return Api.error(ApiErrorCode.INTERNAL, M.FAILED);
  }
}
