import {
  Api,
  ApiErrorCode,
  type ApiResponse,
} from "../../../../../Kernel/ApiResponse";
import { Logger } from "../../../../../Kernel/Logger";
import { processBatchDeleteCategory } from "../../../../Application/Services/BatchDeleteCategoryHandler";
import { BatchDeleteCategoryInput } from "./BatchDeleteCategoryInput";

const M = {
  BAD_INPUT: "Invalid request.",
  FAILED: "Failed to delete categories.",
  NOT_FOUND: "Categories were not found.",
  SUCCESS: "Selected categories deleted.",
  PARTIAL: "Some categories were not found and were not deleted.",
};

export async function batchDeleteCategories(
  input: BatchDeleteCategoryInput
): Promise<
  ApiResponse<{
    deletedCount: number;
    deletedIds: number[];
    notFoundIds: number[];
    attempted: number;
  }>
> {
  try {
    const ids = Array.from(
      new Set(
        (input?.categoryIds ?? []).filter((n) => Number.isFinite(n) && n > 0)
      )
    );
    if (!ids.length) {
      return Api.error(ApiErrorCode.BAD_REQUEST, M.BAD_INPUT);
    }
    const LIMITED = ids.slice(0, 200);
    const { attempted, deletedCount, deletedIds, notFoundIds } =
      await processBatchDeleteCategory({
        categoryIds: LIMITED,
        userId: input?.userId,
      });
    if (deletedCount === 0) {
      return Api.error(ApiErrorCode.NOT_FOUND, M.NOT_FOUND, {
        attempted,
        notFoundIds,
      });
    }
    const message = notFoundIds.length ? M.PARTIAL : M.SUCCESS;
    return Api.ok(
      { attempted, deletedCount, deletedIds, notFoundIds },
      message
    );
  } catch (e) {
    Logger.error("BatchDeleteCategoryController error", { error: String(e) });
    return Api.error(ApiErrorCode.INTERNAL, M.FAILED);
  }
}
