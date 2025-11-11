// src/api/Cloth/Application/Services/DeleteClothHandler.ts
import { DeleteClothDTO } from "../Commands/DeleteClothDTO";
import { deleteCloth as repoDeleteCloth } from "../../Infrastructure/ClothRepository";
import { Logger } from "../../../Kernel/Logger";

export async function processDeleteCloth(
  dto: DeleteClothDTO
): Promise<{ deleted: boolean }> {
  try {
    const ok = await repoDeleteCloth(dto.clothId, dto.userId);
    return { deleted: ok };
  } catch (e) {
    Logger.error("DeleteClothHandler failed", { dto, error: String(e) });
    throw e;
  }
}
