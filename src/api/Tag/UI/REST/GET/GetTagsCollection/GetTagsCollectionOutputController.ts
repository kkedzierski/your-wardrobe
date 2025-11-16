import { getActiveUserId } from "../../../../../../auth/ensureGuestUser";
import {
  Api,
  ApiErrorCode,
  ApiResponse,
} from "../../../../../Kernel/ApiResponse";
import { Logger } from "../../../../../Kernel/Logger";
import { getAllTags } from "../../../../Infrastructure/TagRepository";
import type { GetTagsCollectionOutput } from "./GetTagsCollectionOutput";

type Query = {
  limit?: number;
  offset?: number;
  sort?: "created_at:desc" | "created_at:asc" | "name:asc" | "name:desc";
};

export async function getTagsCollection(
  query: Query = {}
): Promise<ApiResponse<GetTagsCollectionOutput>> {
  try {
    const userId = await getActiveUserId();
    const limitRaw = Number.isFinite(query.limit) ? Number(query.limit) : 100;
    const offsetRaw = Number.isFinite(query.offset) ? Number(query.offset) : 0;
    const limit = Math.min(Math.max(1, limitRaw), 200);
    const offset = Math.max(0, offsetRaw);
    const allowedSort = [
      "created_at:desc",
      "created_at:asc",
      "name:asc",
      "name:desc",
    ];
    const sort = allowedSort.includes(query.sort as any)
      ? (query.sort as any)
      : "created_at:desc";
    const tags = await getAllTags({
      userId,
      limit,
      offset,
      sort,
    });
    const data: GetTagsCollectionOutput = {
      items: tags.map((c) => ({
        id: c.id,
        name: c.name,
      })),
    };
    return Api.ok<GetTagsCollectionOutput>(data);
  } catch (error) {
    Logger.error("GetTagsCollectionOutputController error", {
      error: String(error),
    });
    return Api.error(ApiErrorCode.INTERNAL, "Failed to get tags.");
  }
}
