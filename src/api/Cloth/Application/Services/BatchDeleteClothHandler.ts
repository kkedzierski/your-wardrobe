import type { BatchDeleteClothDTO } from "../Commands/BatchDeleteClothDTO";
import { deleteClothesBatch } from "../../Infrastructure/ClothRepository";
import { Logger } from "../../../Kernel/Logger";

export async function processBatchDeleteCloth(dto: BatchDeleteClothDTO) {
  try {
    const result = await deleteClothesBatch(dto.clothIds, dto.userId);
    return result; // { attempted, deletedCount, deletedIds, notFoundIds }
  } catch (e) {
    Logger.error("BatchDeleteClothHandler failed", { dto, error: String(e) });
    throw e;
  }
}
