import { Api, ApiErrorCode } from "../../../../Kernel/ApiResponse";
import { processEditCloth } from "../../../Application/Services/EditClothHandler";
import { EditClothInput } from "./EditClothInput";

// EN zdania — zostaną przetłumaczone w warstwie prezentacji
const M = {
  BAD_INPUT: "Invalid request.",
  NOT_FOUND: "Cloth was not found.",
  FAILED: "Failed to update cloth.",
  SUCCESS: "Cloth updated.",
};

export async function editCloth(input: EditClothInput) {
  try {
    if (!input?.clothId || input.clothId <= 0) {
      return Api.error(ApiErrorCode.BAD_REQUEST, M.BAD_INPUT);
    }

    const { updated } = await processEditCloth({
      clothId: input.clothId,
      userId: input.userId,
      patch: {
        name: input.name,
        description: input.description,
        color: input.color,
        brand: input.brand,
        location: input.location,
        categoryId: input.categoryId,
        tagIds: input.tagIds,
      },
    });

    if (!updated) {
      // brak zmian lub brak rekordu
      return Api.error(ApiErrorCode.NOT_FOUND, M.NOT_FOUND);
    }

    // sukces + message (EN). Message jest opcjonalne wg Twoich reguł,
    // ale zostawiamy je jak w przykładzie DELETE.
    return Api.ok(updated, M.SUCCESS);
  } catch (e) {
    return Api.error(ApiErrorCode.INTERNAL, M.FAILED);
  }
}
