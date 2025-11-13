import { EditClothDTO } from "../Commands/EditClothDTO";
import {
  replaceClothTags,
  updateCloth,
} from "../../Infrastructure/ClothRepository";
import { Logger } from "../../../Kernel/Logger";

export async function processEditCloth(dto: EditClothDTO): Promise<{
  updated: null | {
    clothId: number;
    name?: string;
    description?: string;
    color?: string;
    brand?: string;
    categoryId?: number;
    tagIds?: number[];
    location?: string;
    updatedAt: string;
  };
}> {
  try {
    // 1) aktualizacja pól ubrania
    const { tagIds, ...patchWithoutTags } = dto.patch as any;

    const rec = await updateCloth(dto.clothId, patchWithoutTags, dto.userId);

    // 2) tagi – jeśli podane
    if (Array.isArray(tagIds)) {
      await replaceClothTags(dto.clothId, tagIds, dto.userId);
    }

    return { updated: rec };
  } catch (e) {
    Logger.error("EditClothHandler failed", { dto, error: String(e) });
    throw e;
  }
}
