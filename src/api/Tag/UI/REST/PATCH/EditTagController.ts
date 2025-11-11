import { Api, ApiErrorCode } from "../../../../Kernel/ApiResponse";
import { processEditTag } from "../../../Application/Services/EditTagHandler";
import { EditTagInput } from "./EditTagInput";

const M = {
  BAD_INPUT: "Invalid request.",
  NOT_FOUND: "Tag was not found.",
  FAILED: "Failed to update tag.",
  SUCCESS: "Tag updated.",
};

export async function editTag(input: EditTagInput) {
  try {
    if (!input?.tagId || input.tagId <= 0) {
      return Api.error(ApiErrorCode.BAD_REQUEST, M.BAD_INPUT);
    }
    const { updated } = await processEditTag({
      tagId: input.tagId,
      userId: input.userId,
      patch: {
        name: input.name,
      },
    });
    if (!updated) {
      return Api.error(ApiErrorCode.NOT_FOUND, M.NOT_FOUND);
    }
    return Api.ok(updated, M.SUCCESS);
  } catch (e) {
    return Api.error(ApiErrorCode.INTERNAL, M.FAILED);
  }
}
