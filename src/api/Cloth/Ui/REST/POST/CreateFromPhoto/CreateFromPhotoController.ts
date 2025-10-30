import { CreateClothFromPhotoInput } from "./CreateFromPhotoInput";
import { ApiErrorCode, ApiResponse } from "../../../../../Kernel/ApiResponse";
import { validatePhotoInput } from "./Validators/validatePhotoInput";
import { CreateClothFromPhotoHandler } from "../../../../Application/Services/CreateClothFromPhotoHandler";
import { ClothFromPhotoDTO } from "../../../../Application/Commands/ClothFromPhotoDTO";
import { CreateClothFromPhotoCommand } from "../../../../Application/Commands/CreateClothFromPhotoCommand";

export async function createClothFromPhoto(
  input: CreateClothFromPhotoInput,
  userId: number
): Promise<ApiResponse<ClothFromPhotoDTO>> {
  const validated = validatePhotoInput(input.photo);
  if (!validated.ok) {
    return new ApiResponse<ClothFromPhotoDTO>({
      ok: false,
      code: validated.code ?? ApiErrorCode.BAD_REQUEST,
      message: validated.message ?? "Invalid photo input.",
      logInfo: true,
      customLogMessage: "createClothFromPhoto: invalid photo",
    });
  }

  const command: CreateClothFromPhotoCommand = {
    photo: validated.data!.blob,
    name: input.name,
    description: input.description,
    category_id: input.category_id,
    color: input.color,
    brand: input.brand,
    season: input.season,
    location: input.location,
    tags: input.tags,
    ai_suggestions: input.ai_suggestions,
    userId,
  };

  try {
    const dto = await CreateClothFromPhotoHandler.handle(command);
    return new ApiResponse<ClothFromPhotoDTO>({ ok: true, data: dto });
  } catch (e: any) {
    // AppException -- obsłuż błędny przypadek aplikacyjny
    return new ApiResponse<ClothFromPhotoDTO>({
      ok: false,
      code: e.code ?? ApiErrorCode.INTERNAL,
      message: e.message ?? "Application error.",
      logInfo: true,
      customLogMessage: e.customLogMessage ?? "Exception in handler",
    });
  }
}
