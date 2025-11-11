import { getActiveUserId } from "../../../../../../auth/ensureGuestUser";
import {
  Api,
  ApiErrorCode,
  ApiResponse,
} from "../../../../../Kernel/ApiResponse";
import { Logger } from "../../../../../Kernel/Logger";
import { getClothById } from "../../../../Infrastructure/ClothRepository";
import type { GetClothItemInput } from "./GetClothItemInput";
import type { GetClothItemOutput } from "./GetClothItemOutput";

export async function getClothItem(
  input: Partial<GetClothItemInput>
): Promise<ApiResponse<GetClothItemOutput>> {
  try {
    // Minimalna walidacja wejścia
    const idNum = Number(input?.id);
    if (!Number.isFinite(idNum) || idNum <= 0) {
      return Api.error(
        ApiErrorCode.BAD_REQUEST,
        "Cloth id must be a positive number."
      );
    }

    const userId = await getActiveUserId();

    const item = await getClothById({ userId, id: idNum });
    if (!item) {
      return Api.error(ApiErrorCode.NOT_FOUND, "Cloth not found.");
    }

    // Mapowanie do kontraktu Output
    const data: GetClothItemOutput = {
      id: item.id,
      name: item.name,
      description: item.description ?? null,
      brand: item.brand ?? null,
      color: item.color ?? null,
      season: item.season ?? null,
      location: item.location ?? null,
      category: item.category
        ? { id: item.category.id, name: item.category.name }
        : null,
      tags: (item.tags ?? []).map((t) => ({ id: t.id, name: t.name })),
    };

    return Api.ok<GetClothItemOutput>(data);
  } catch (error) {
    Logger.error("Cloth/GetClothItemController", error);
    // EN, bez translacji tutaj
    return Api.error(ApiErrorCode.INTERNAL, "Failed to get cloth.");
  }
}
