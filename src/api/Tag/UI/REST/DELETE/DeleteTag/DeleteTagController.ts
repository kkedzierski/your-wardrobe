import { Api, ApiErrorCode } from "../../../../../Kernel/ApiResponse";
import { DeleteTagInput } from "./DeleteTagInput";
import { processDeleteTag } from "../../../../Application/Services/DeleteTagHandler";
import { Logger } from "../../../../../Kernel/Logger";

const M = {
  BAD_INPUT: "Invalid request.",
  NOT_FOUND: "Tag was not found.",
  FAILED: "Failed to delete tag.",
  SUCCESS: "Tag deleted.",
};

export async function deleteTag(input: DeleteTagInput) {
  try {
    if (!input?.tagId || input.tagId <= 0) {
      return Api.error(ApiErrorCode.BAD_REQUEST, M.BAD_INPUT);
    }
    const { deleted } = await processDeleteTag({
      tagId: input.tagId,
      userId: input.userId,
    });
    if (!deleted) {
      return Api.error(ApiErrorCode.NOT_FOUND, M.NOT_FOUND);
    }
    return Api.ok<{ tagId: number }>({ tagId: input.tagId }, M.SUCCESS);
  } catch (e) {
    Logger.error("DeleteTagController error", { error: String(e) });
    return Api.error(ApiErrorCode.INTERNAL, M.FAILED);
  }
}
