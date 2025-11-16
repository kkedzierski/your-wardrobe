import { getActiveUserId } from "../../../../../../auth/ensureGuestUser";
import {
  Api,
  ApiErrorCode,
  ApiResponse,
} from "../../../../../Kernel/ApiResponse";
import { Logger } from "../../../../../Kernel/Logger";
import { getTagById } from "../../../../Infrastructure/TagRepository";
import type { GetTagItemInput } from "./GetTagItemInput";
import type { GetTagItemOutput } from "./GetTagItemOutput";

export async function getTagItem(
  input: Partial<GetTagItemInput>
): Promise<ApiResponse<GetTagItemOutput>> {
  try {
    const idNum = Number(input?.id);
    if (!Number.isFinite(idNum) || idNum <= 0) {
      return Api.error(
        ApiErrorCode.BAD_REQUEST,
        "Tag id must be a positive number."
      );
    }
    const userId = await getActiveUserId();
    const item = await getTagById({ userId, id: idNum });
    if (!item) {
      return Api.error(ApiErrorCode.NOT_FOUND, "Tag not found.");
    }
    const data: GetTagItemOutput = {
      id: item.id,
      name: item.name,
    };
    return Api.ok<GetTagItemOutput>(data);
  } catch (error) {
    Logger.error("GetTagItemController error", { error: String(error) });
    return Api.error(ApiErrorCode.INTERNAL, "Failed to get tag.");
  }
}
