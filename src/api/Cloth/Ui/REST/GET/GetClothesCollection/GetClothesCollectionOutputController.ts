// api/Cloth/Ui/REST/GET/GetClothesOutputController.ts
import { getActiveUserId } from "../../../../../../auth/ensureGuestUser";
import {
  Api,
  ApiErrorCode,
  ApiResponse,
} from "../../../../../Kernel/ApiResponse";
import { Logger } from "../../../../../Kernel/Logger";
import {
  getAllCloths,
  type GetAllClothsSort,
} from "../../../../Infrastructure/ClothRepository";
import type { GetClothesCollectionOutput } from "./GetClothesCollectionOutput";

type Query = {
  limit?: number;
  offset?: number;
  sort?: GetAllClothsSort; // "created_at:desc" | "created_at:asc" | "name:asc" | "name:desc"
};

export async function getClothesCollection(
  query: Query = {}
): Promise<ApiResponse<GetClothesCollectionOutput>> {
  try {
    const userId = await getActiveUserId();

    // domyślne wartości + minimalna walidacja
    const limitRaw = Number.isFinite(query.limit) ? Number(query.limit) : 100;
    const offsetRaw = Number.isFinite(query.offset) ? Number(query.offset) : 0;

    const limit = Math.min(Math.max(1, limitRaw), 200); // 1..200
    const offset = Math.max(0, offsetRaw);

    const allowedSort: GetAllClothsSort[] = [
      "created_at:desc",
      "created_at:asc",
      "name:asc",
      "name:desc",
    ];
    const sort: GetAllClothsSort = allowedSort.includes(
      query.sort as GetAllClothsSort
    )
      ? (query.sort as GetAllClothsSort)
      : "created_at:desc";

    const cloths = await getAllCloths({
      userId,
      limit,
      offset,
      sort,
    });

    // Mapowanie do kontraktu Output (items: {id, name, thumbUrl}[])
    const data: GetClothesCollectionOutput = {
      items: cloths.map((c) => ({
        id: c.id,
        name: c.name,
        thumbUrl: c.thumbUrl,
      })),
    };

    return Api.ok<GetClothesCollectionOutput>(data);
  } catch (error) {
    Logger.error("GetClothesOutputController", error);
    // EN po zdaniu – bez translacji tutaj
    return Api.error(ApiErrorCode.INTERNAL, "Failed to get clothes.");
  }
}
