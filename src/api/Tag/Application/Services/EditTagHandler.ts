import { EditTagDTO } from "../Commands/EditTagDTO";
import { updateTag } from "../../Infrastructure/TagRepository";

export async function processEditTag(dto: EditTagDTO): Promise<{
  updated: null | {
    tagId: number;
    name?: string;
    updatedAt: string;
  };
}> {
  const rec = await updateTag(dto.tagId, dto.patch, dto.userId);
  return { updated: rec };
}
