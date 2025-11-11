import { getActiveUserId } from "../../../../auth/ensureGuestUser";
import { insertClothWithPhoto } from "../../../Cloth/Infrastructure/ClothRepository";
import { EventBus, EVENTS } from "../../../../events/bus";
import { saveImage } from "./SaveImageService";
import { hashFileSha256Base64 } from "./HashService";
import { CreateClothFromPhotoCommand } from "../Commands/CreateClothFromPhotoCommand";
import { CreateClothFromPhotoDTO } from "../Commands/CreateFromPhotoDTO";

export async function createClothFromPhoto(
  cmd: CreateClothFromPhotoCommand
): Promise<CreateClothFromPhotoDTO> {
  // 1) hash
  const hash = await hashFileSha256Base64(cmd.srcUri);

  // 2) zapis obrazu
  const saved = await saveImage({
    srcUri: cmd.srcUri,
    targetDir: cmd.targetDir,
    hash,
    fileName: cmd.fileName ?? undefined,
    mimeType: cmd.mimeType ?? undefined,
    forceExt: cmd.forceExt,
  });

  // 3) DB
  const userUuid = await getActiveUserId();
  const { clothId } = await insertClothWithPhoto({
    user_id: userUuid,
    file_path: saved.destUri,
    hash,
    main: cmd.main ? 1 : 0,
  });

  // 4) Event
  EventBus.emit(EVENTS.WARDROBE_PHOTO_ADDED);

  return {
    clothId,
    destUri: saved.destUri,
    hash,
    ext: saved.ext,
  };
}
