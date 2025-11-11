import { Api, ApiErrorCode } from "../../../../../Kernel/ApiResponse";
import { createCategory } from "../../../../Application/Services/CreateCategoryHandler";
import { CreateCategoryInput } from "./CreateCategoryInput";
import { CreateCategoryDTO } from "../../../../Application/Commands/CreateCategoryDTO";
import { Logger } from "../../../../../Kernel/Logger";

export async function postCreateCategory(
  input: CreateCategoryInput
): Promise<ReturnType<typeof Api.ok<CreateCategoryDTO> | typeof Api.error>> {
  try {
    if (!input?.name || typeof input.name !== "string" || !input.name.trim()) {
      return Api.error(ApiErrorCode.BAD_REQUEST, "Category name is required.");
    }
    const dto = await createCategory({ name: input.name.trim() });
    return Api.ok<CreateCategoryDTO>(dto, "Category created.");
  } catch (e: any) {
    Logger.error("CreateCategory", e);
    return Api.error(
      ApiErrorCode.INTERNAL,
      e?.message ?? "Failed to create category."
    );
  }
}
