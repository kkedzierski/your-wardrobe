import { DeleteTagDTO } from "../Commands/DeleteTagDTO";
import { deleteTag as repoDeleteTag } from "../../Infrastructure/TagRepository";

export async function processDeleteTag(
  dto: DeleteTagDTO
): Promise<{ deleted: boolean }> {
  const ok = await repoDeleteTag(dto.tagId, dto.userId);
  return { deleted: ok };
}
