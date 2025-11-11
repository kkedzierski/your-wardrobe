import { EditClothDTO } from "../Commands/EditClothDTO";
import { updateCloth } from "../../Infrastructure/ClothRepository";
import { Logger } from "../../../Kernel/Logger";

// Funkcyjny handler – zgodnie z konwencją: processX
export async function processEditCloth(dto: EditClothDTO): Promise<{
  updated: null | {
    clothId: number;
    description?: string;
    color?: string;
    brand?: string;
    location?: string;
    updatedAt: string;
  };
}> {
  try {
    const rec = await updateCloth(dto.clothId, dto.patch, dto.userId);
    return { updated: rec };
  } catch (e) {
    Logger.error("EditClothHandler failed", { dto, error: String(e) });
    throw e;
  }
}
