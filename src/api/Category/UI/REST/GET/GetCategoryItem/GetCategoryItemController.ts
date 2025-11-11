import { getActiveUserId } from "../../../../../../auth/ensureGuestUser";
import {
  Api,
  ApiErrorCode,
  ApiResponse,
} from "../../../../../Kernel/ApiResponse";
import { Logger } from "../../../../../Kernel/Logger";
import { getCategoryById } from "../../../../Infrastructure/CategoryRepository";
import type { GetCategoryItemInput } from "./GetCategoryItemInput";
import type { GetCategoryItemOutput } from "./GetCategoryItemOutput";

export async function getCategoryItem(
  input: Partial<GetCategoryItemInput>
): Promise<ApiResponse<GetCategoryItemOutput>> {
  try {
    const idNum = Number(input?.id);
    if (!Number.isFinite(idNum) || idNum <= 0) {
      return Api.error(
        ApiErrorCode.BAD_REQUEST,
        "Category id must be a positive number."
      );
    }
    const userId = await getActiveUserId();
    const item = await getCategoryById({ userId, id: idNum });
    if (!item) {
      return Api.error(ApiErrorCode.NOT_FOUND, "Category not found.");
    }
    const data: GetCategoryItemOutput = {
      id: item.id,
      name: item.name,
    };
    return Api.ok<GetCategoryItemOutput>(data);
  } catch (error) {
    Logger.error("Category/GetCategoryItemController", error);
    return Api.error(ApiErrorCode.INTERNAL, "Failed to get category.");
  }
}
