// src/api/Cloth/Ui/REST/DELETE/BatchDeleteCloth/BatchDeleteClothController.ts
import {
  Api,
  ApiErrorCode,
  type ApiResponse,
} from "../../../../../Kernel/ApiResponse";
import { Logger } from "../../../../../Kernel/Logger";
import { processBatchDeleteCloth } from "../../../../Application/Services/BatchDeleteClothHandler";
import { BatchDeleteClothInput } from "./BatchDeleteClothInput";

const M = {
  BAD_INPUT: "Invalid request.",
  FAILED: "Failed to delete clothes.",
  NOT_FOUND: "Clothes were not found.",
  SUCCESS: "Selected clothes deleted.",
  PARTIAL: "Some clothes were not found and were not deleted.",
};

export async function BatchDeleteClothController(
  input: BatchDeleteClothInput
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
        (input?.clothIds ?? []).filter((n) => Number.isFinite(n) && n > 0)
      )
    );
    if (!ids.length) {
      return Api.error(ApiErrorCode.BAD_REQUEST, M.BAD_INPUT);
    }
    // mały bezpiecznik – nie pozwalamy jedną operacją „przypadkiem” usunąć wszystkiego
    const LIMITED = ids.slice(0, 200);

    const { attempted, deletedCount, deletedIds, notFoundIds } =
      await processBatchDeleteCloth({
        clothIds: LIMITED,
        userId: input?.userId,
      });

    if (deletedCount === 0) {
      return Api.error(ApiErrorCode.NOT_FOUND, M.NOT_FOUND, {
        attempted,
        notFoundIds,
      });
    }

    // Sukces. Zgodnie z konwencją success message może być, UI przetłumaczy.
    const message = notFoundIds.length ? M.PARTIAL : M.SUCCESS;
    return Api.ok(
      { attempted, deletedCount, deletedIds, notFoundIds },
      message
    );
  } catch (e) {
    Logger.error("BatchDeleteClothController error", { error: String(e) });
    return Api.error(ApiErrorCode.INTERNAL, M.FAILED);
  }
}
