import { getActiveUserId } from "../../../../auth/ensureGuestUser";
import { insertTag } from "../../Tag/Infrastructure/TagRepository";
import { CreateTagCommand } from "../Commands/CreateTagCommand";
import { CreateTagDTO } from "../Commands/CreateTagDTO";

export async function createTag(cmd: CreateTagCommand): Promise<CreateTagDTO> {
  const userId = await getActiveUserId();
  const { tagId } = await insertTag({ userId, name: cmd.name });
  return {
    tagId,
    name: cmd.name,
  };
}
