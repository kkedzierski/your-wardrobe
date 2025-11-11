import {
  Api,
  ApiErrorCode,
  type ApiResponse,
} from "../../../../../Kernel/ApiResponse";
import { Logger } from "../../../../../Kernel/Logger";
import { processBatchDeleteTag } from "../../../../Application/Services/BatchDeleteTagHandler";
import { BatchDeleteTagInput } from "./BatchDeleteTagInput";

const M = {
  BAD_INPUT: "Invalid request.",
  FAILED: "Failed to delete tags.",
  NOT_FOUND: "Tags were not found.",
  SUCCESS: "Selected tags deleted.",
  PARTIAL: "Some tags were not found and were not deleted.",
};

export async function batchDeleteTags(input: BatchDeleteTagInput): Promise<
  ApiResponse<{
    deletedCount: number;
    deletedIds: number[];
    notFoundIds: number[];
    attempted: number;
  }>
> {
  try {
    const ids = Array.from(
      new Set((input?.tagIds ?? []).filter((n) => Number.isFinite(n) && n > 0))
    );
    if (!ids.length) {
      return Api.error(ApiErrorCode.BAD_REQUEST, M.BAD_INPUT);
    }
    const LIMITED = ids.slice(0, 200);
    const { attempted, deletedCount, deletedIds, notFoundIds } =
      await processBatchDeleteTag({
        tagIds: LIMITED,
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
    Logger.error("BatchDeleteTagController error", { error: String(e) });
    return Api.error(ApiErrorCode.INTERNAL, M.FAILED);
  }
}
