import type { BatchDeleteTagDTO } from "../Commands/BatchDeleteTagDTO";
import { deleteTagsBatch } from "../../Infrastructure/TagRepository";

export async function processBatchDeleteTag(dto: BatchDeleteTagDTO) {
  return deleteTagsBatch(dto.tagIds, dto.userId);
}
