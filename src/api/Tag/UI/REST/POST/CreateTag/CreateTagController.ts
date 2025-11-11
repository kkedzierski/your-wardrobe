import { Api, ApiErrorCode } from "../../../../../Kernel/ApiResponse";
import { createTag } from "../../../../Application/Services/CreateTagHandler";
import { CreateTagInput } from "./CreateTagInput";
import { CreateTagDTO } from "../../../../Application/Commands/CreateTagDTO";
import { Logger } from "../../../../../Kernel/Logger";

export async function postCreateTag(
  input: CreateTagInput
): Promise<ReturnType<typeof Api.ok<CreateTagDTO> | typeof Api.error>> {
  try {
    if (!input?.name || typeof input.name !== "string" || !input.name.trim()) {
      return Api.error(ApiErrorCode.BAD_REQUEST, "Tag name is required.");
    }
    const dto = await createTag({ name: input.name.trim() });
    return Api.ok<CreateTagDTO>(dto, "Tag created.");
  } catch (e: any) {
    Logger.error("CreateTag", e);
    return Api.error(
      ApiErrorCode.INTERNAL,
      e?.message ?? "Failed to create tag."
    );
  }
}
