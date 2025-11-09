// api/Cloth/Ui/REST/GET/GetClothesOutputController.ts
import { listClothes } from "../../../Infrastructure/ClothRepository";
import type { GetClothesOutput } from "./GetClothesOutput";

type Query = {
  userId?: number;
  limit?: number;
  offset?: number;
  includeDeleted?: boolean;
  sort?: "created_at:desc" | "created_at:asc" | "name:asc" | "name:desc";
};

// Zero walidacji – bierzemy co przyjdzie i zwracamy dane
export async function GetClothesOutputController(
  query: Query = {}
): Promise<GetClothesOutput> {
  const result = await listClothes({
    userId: query.userId,
    limit: query.limit,
    offset: query.offset,
    includeDeleted: query.includeDeleted,
    sort: query.sort,
  });

  return {
    data: result.items,
    pagination: result.pagination,
  };
}
